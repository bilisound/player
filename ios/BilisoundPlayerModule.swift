import ExpoModulesCore
import AVFoundation
import MediaPlayer

public class BilisoundPlayerModule: Module {
    private static let TAG = "BilisoundPlayerModule"
    private var player: AVQueuePlayer?
    private var playerItems: [AVPlayerItem] = []
    private var currentIndex: Int = 0
    private var headersBank: [String: [String: String]] = [:]
    private var timeObserverToken: Any?
    private var artworkCache: [String: MPMediaItemArtwork] = [:]
    
    deinit {
        if let token = timeObserverToken {
            player?.removeTimeObserver(token)
        }
    }
    
    // Define your module's methods
    public func definition() -> ModuleDefinition {
        Name("BilisoundPlayer")
        
        // Events that can be emitted to JavaScript
        Events(
            "onPlaybackStateChange",
            "onPlaybackError",
            "onQueueChange",
            "onTrackChange",
            "onIsPlayingChange",
            "onDownloadUpdate"
        )
        
        OnCreate {
            print("\(BilisoundPlayerModule.TAG): Initializing player module")
            self.setupPlayer()
            self.setupRemoteTransportControls()
        }
        
        OnDestroy {
            print("\(BilisoundPlayerModule.TAG): Destroying player module")
            self.cleanupPlayer()
        }
        
        // Headers management functions
        Function("setHeadersOnBank") { (key: String, headers: [String: String]) in
            self.headersBank[key] = headers
        }
        
        Function("deleteHeadersOnBank") { (key: String) in
            self.headersBank.removeValue(forKey: key)
        }
        
        Function("clearHeadersOnBank") {
            self.headersBank.removeAll()
        }
        
        // Player control functions
        AsyncFunction("toggle") { (promise: Promise) in
            do {
                if let player = self.player {
                    if player.timeControlStatus == .playing {
                        player.pause()
                    } else {
                        player.play()
                    }
                    promise.resolve()
                } else {
                    throw NSError(domain: "BilisoundPlayer", code: -1, userInfo: [NSLocalizedDescriptionKey: "Player is not initialized"])
                }
            } catch {
                promise.reject("PLAYER_ERROR", "Failed to toggle playback: \(error.localizedDescription)")
            }
        }
        
        Function("play") { () -> Void in
            self.player?.play()
        }
        
        Function("pause") { () -> Void in
            self.player?.pause()
        }
        
        Function("stop") { () -> Void in
            self.player?.pause()
            self.player?.seek(to: .zero)
        }
        
        Function("seek") { (position: Double) -> Void in
            let time = CMTime(seconds: position, preferredTimescale: 1000)
            self.player?.seek(to: time)
        }
        
        AsyncFunction("skipToNext") { (promise: Promise) in
            do {
                if self.skipToNext() {
                    promise.resolve()
                } else {
                    throw NSError(domain: "BilisoundPlayer", code: -1, userInfo: [NSLocalizedDescriptionKey: "No next track available"])
                }
            } catch {
                promise.reject("PLAYER_ERROR", "Failed to skip to next track: \(error.localizedDescription)")
            }
        }
        
        AsyncFunction("skipToPrevious") { (promise: Promise) in
            do {
                if self.skipToPrevious() {
                    promise.resolve()
                } else {
                    throw NSError(domain: "BilisoundPlayer", code: -1, userInfo: [NSLocalizedDescriptionKey: "No previous track available"])
                }
            } catch {
                promise.reject("PLAYER_ERROR", "Failed to skip to previous track: \(error.localizedDescription)")
            }
        }
        
        // Add tracks functions
        AsyncFunction("addTracks") { (jsonContent: String, promise: Promise) in
            do {
                print("\(BilisoundPlayerModule.TAG): User attempting to add multiple tracks")
                guard let jsonData = jsonContent.data(using: .utf8),
                      let tracksArray = try JSONSerialization.jsonObject(with: jsonData) as? [[String: Any]] else {
                    throw NSError(domain: "BilisoundPlayer", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid JSON format"])
                }
                
                // Create AVPlayerItems for each track
                let newItems = try tracksArray.map { try self.createPlayerItem(from: $0) }
                
                // Add items to our tracking array
                self.playerItems.append(contentsOf: newItems)
                
                // If this is the first track
                if self.player?.items().isEmpty ?? true {
                    self.currentIndex = 0
                    self.updatePlayerQueue()
                }
                
                // Fire playlist change event
                self.firePlaylistChangeEvent()
                
                promise.resolve()
            } catch {
                promise.reject("PLAYER_ERROR", "Failed to add tracks: \(error.localizedDescription)")
            }
        }
    }
    
    private func setupPlayer() {
        // Initialize AVQueuePlayer
        player = AVQueuePlayer()
        
        // Set up audio session for background playback
        do {
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(.playback, mode: .default, options: [.allowBluetooth, .allowAirPlay])
            try session.setActive(true, options: .notifyOthersOnDeactivation)
            
            // Enable background playback
            setupRemoteTransportControls()
            
            // Enable playback information in control center
            UIApplication.shared.beginReceivingRemoteControlEvents()
        } catch {
            print("\(BilisoundPlayerModule.TAG): Failed to set up audio session: \(error)")
        }
        
        // Add observers for player state changes
        setupPlayerObservers()
    }
    
    private func setupRemoteTransportControls() {
        let commandCenter = MPRemoteCommandCenter.shared()
        
        // Add handler for play command
        commandCenter.playCommand.addTarget { [weak self] _ in
            self?.player?.play()
            return .success
        }
        
        // Add handler for pause command
        commandCenter.pauseCommand.addTarget { [weak self] _ in
            self?.player?.pause()
            return .success
        }
        
        // Add handler for next track command
        commandCenter.nextTrackCommand.addTarget { [weak self] _ in
            guard let self = self else { return .commandFailed }
            return self.skipToNext() ? .success : .noSuchContent
        }
        
        // Add handler for previous track command
        commandCenter.previousTrackCommand.addTarget { [weak self] _ in
            guard let self = self else { return .commandFailed }
            return self.skipToPrevious() ? .success : .noSuchContent
        }
        
        // Add handler for seeking
        commandCenter.changePlaybackPositionCommand.addTarget { [weak self] event in
            guard let self = self,
                  let player = self.player,
                  let positionCommand = event as? MPChangePlaybackPositionCommandEvent else {
                return .commandFailed
            }
            
            player.seek(to: CMTime(seconds: positionCommand.positionTime, preferredTimescale: 1000))
            return .success
        }
    }
    
    private func setupPlayerObservers() {
        // Observe playback status changes
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handlePlaybackEnd),
            name: .AVPlayerItemDidPlayToEndTime,
            object: nil
        )
        
        // Add periodic time observer
        let interval = CMTime(seconds: 1, preferredTimescale: 1)
        timeObserverToken = player?.addPeriodicTimeObserver(forInterval: interval, queue: .main) { [weak self] time in
            self?.updateNowPlayingInfo()
        }
        
        // Observe item changes
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleCurrentItemChange),
            name: .AVPlayerItemDidPlayToEndTime,
            object: nil
        )
    }
    
    @objc private func handleCurrentItemChange(notification: Notification) {
        if let item = player?.currentItem,
           let index = playerItems.firstIndex(of: item) {
            currentIndex = index
            updateNowPlayingInfo()
        }
    }
    
    private func loadArtwork(urlString: String, completion: @escaping (MPMediaItemArtwork?) -> Void) {
        // Check cache first
        if let cachedArtwork = artworkCache[urlString] {
            completion(cachedArtwork)
            return
        }
        
        // Create URL
        guard let url = URL(string: urlString) else {
            completion(nil)
            return
        }
        
        // Create URLSession task
        let task = URLSession.shared.dataTask(with: url) { [weak self] (data, response, error) in
            guard let self = self,
                  let data = data,
                  let image = UIImage(data: data) else {
                DispatchQueue.main.async {
                    completion(nil)
                }
                return
            }
            
            // Create artwork
            let artwork = MPMediaItemArtwork(boundsSize: image.size) { _ in image }
            
            // Cache the artwork
            self.artworkCache[urlString] = artwork
            
            // Return on main thread
            DispatchQueue.main.async {
                completion(artwork)
            }
        }
        
        task.resume()
    }
    
    private func updateNowPlayingInfo() {
        guard let player = player,
              let currentItem = player.currentItem,
              let metadata = getTrackMetadata(from: currentItem) else {
            return
        }
        
        var nowPlayingInfo: [String: Any] = [
            MPMediaItemPropertyTitle: metadata["title"] as? String ?? "Unknown Title",
            MPMediaItemPropertyArtist: metadata["artist"] as? String ?? "Unknown Artist",
            MPNowPlayingInfoPropertyElapsedPlaybackTime: CMTimeGetSeconds(currentItem.currentTime()),
            MPMediaItemPropertyPlaybackDuration: metadata["duration"] as? Double ?? 0,
            MPNowPlayingInfoPropertyPlaybackRate: player.rate,
            MPNowPlayingInfoPropertyDefaultPlaybackRate: 1.0,
            MPNowPlayingInfoPropertyPlaybackQueueCount: playerItems.count,
            MPNowPlayingInfoPropertyPlaybackQueueIndex: currentIndex
        ]
        
        // Update now playing info first without artwork
        MPNowPlayingInfoCenter.default().nowPlayingInfo = nowPlayingInfo
        
        // Then load artwork asynchronously
        if let artworkUrlString = metadata["artworkUri"] as? String {
            loadArtwork(urlString: artworkUrlString) { [weak self] artwork in
                guard let artwork = artwork else { return }
                
                // Update now playing info with artwork
                if var currentInfo = MPNowPlayingInfoCenter.default().nowPlayingInfo {
                    currentInfo[MPMediaItemPropertyArtwork] = artwork
                    MPNowPlayingInfoCenter.default().nowPlayingInfo = currentInfo
                }
            }
        }
    }
    
    private func cleanupPlayer() {
        player?.pause()
        NotificationCenter.default.removeObserver(self)
        artworkCache.removeAll()
        player = nil
    }
    
    @objc private func handlePlaybackEnd(notification: Notification) {
        // Handle playback completion
    }
    
    private struct AssociatedKeys {
        static var metadata = "com.bilisound.player.metadata"
    }
    
    private func createPlayerItem(from track: [String: Any]) throws -> AVPlayerItem {
        guard let urlString = track["uri"] as? String,
              let url = URL(string: urlString) else {
            throw NSError(domain: "BilisoundPlayer", code: -1, userInfo: [NSLocalizedDescriptionKey: "Invalid URL"])
        }
        
        var asset: AVURLAsset
        if let headersString = track["headers"] as? String,
           let headersData = headersString.data(using: .utf8),
           let headers = try? JSONSerialization.jsonObject(with: headersData) as? [String: String] {
            // Create asset with headers
            let options = ["AVURLAssetHTTPHeaderFieldsKey": headers]
            asset = AVURLAsset(url: url, options: options)
        } else {
            // Create asset without headers
            asset = AVURLAsset(url: url)
        }
        
        let item = AVPlayerItem(asset: asset)
        
        // Store metadata as associated object
        var metadata: [String: Any] = [:]
        metadata["uri"] = urlString
        metadata["title"] = track["title"] as? String
        metadata["artist"] = track["artist"] as? String
        metadata["artworkUri"] = track["artworkUri"] as? String
        metadata["duration"] = track["duration"] as? Double
        
        objc_setAssociatedObject(item, &AssociatedKeys.metadata, metadata, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
        
        return item
    }
    
    private func getTrackMetadata(from item: AVPlayerItem) -> [String: Any]? {
        if let metadata = objc_getAssociatedObject(item, &AssociatedKeys.metadata) as? [String: Any] {
            return metadata
        }
        
        // Fallback: return basic info if metadata is not available
        if let asset = item.asset as? AVURLAsset {
            return ["uri": asset.url.absoluteString]
        }
        
        return nil
    }
    
    private func firePlaylistChangeEvent() {
        // Convert current playlist to JSON and emit event
        let tracks = playerItems.map { getTrackMetadata(from: $0) }
        
        if let jsonData = try? JSONSerialization.data(withJSONObject: tracks),
           let jsonString = String(data: jsonData, encoding: .utf8) {
            self.sendEvent("onQueueChange", [
                "tracks": jsonString
            ])
        }
    }
    
    private func updatePlayerQueue() {
        guard let player = player else { return }
        
        // Remove all items
        while player.items().count > 0 {
            player.remove(player.items().last!)
        }
        
        // Add all items from current index
        for item in playerItems[currentIndex...] {
            player.insert(item, after: player.items().last)
        }
        
        // Start playing if not already
        if player.timeControlStatus != .playing {
            player.play()
        }
    }
    
    private func skipToPrevious() -> Bool {
        guard let player = player,
              let currentItem = player.currentItem else { return false }
        
        let currentTime = CMTimeGetSeconds(currentItem.currentTime())
        
        if currentTime >= 3.0 {
            player.seek(to: .zero)
            return true
        }
        
        // Otherwise, go to previous track if available
        guard currentIndex > 0 else {
            print("没有可供继续切换的歌曲")
            return true
        } // Return true because we still reset to beginning
        
        print("正在切换到上一首歌曲")
        currentIndex -= 1
        updatePlayerQueue()
        
        // Reset to beginning of current track
        player.seek(to: .zero)
        
        return true
    }
    
    private func skipToNext() -> Bool {
        guard currentIndex < playerItems.count - 1 else { return false }
        currentIndex += 1
        updatePlayerQueue()
        
        // Reset to beginning of current track
        player?.seek(to: .zero)
        
        return true
    }
}

// Helper extension for safe array access
extension Array {
    subscript(safe index: Int) -> Element? {
        return indices.contains(index) ? self[index] : nil
    }
}
