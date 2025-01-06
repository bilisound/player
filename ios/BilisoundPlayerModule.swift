import ExpoModulesCore
import AVFoundation
import MediaPlayer

public class BilisoundPlayerModule: Module {
    private static let TAG = "BilisoundPlayerModule"
    private var player: AVQueuePlayer?
    private var playerItems: [AVPlayerItem] = []
    private var currentIndex: Int = 0
    private var headersBank: [String: [String: String]] = [:]
    
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
        
        Function("skipToNext") { () -> Void in
            // Implementation for next track
        }
        
        Function("skipToPrevious") { () -> Void in
            // Implementation for previous track
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
                
                // If player is not initialized, create it with all items
                if self.player == nil {
                    self.player = AVQueuePlayer(items: self.playerItems)
                } else {
                    // Add new items to the queue
                    for item in newItems {
                        self.player?.insert(item, after: nil) // Add to end of queue
                    }
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
                // TODO: Implement next track logic
                return .success
            }
            
            // Add handler for previous track command
            commandCenter.previousTrackCommand.addTarget { [weak self] _ in
                // TODO: Implement previous track logic
                return .success
            }
            
            // Enable playback information in control center
            UIApplication.shared.beginReceivingRemoteControlEvents()
        } catch {
            print("\(BilisoundPlayerModule.TAG): Failed to set up audio session: \(error)")
        }
        
        // Add observers for player state changes
        setupPlayerObservers()
    }
    
    private func setupPlayerObservers() {
        player?.addPeriodicTimeObserver(forInterval: CMTime(seconds: 1, preferredTimescale: 1), queue: .main) { [weak self] time in
            // Handle playback progress updates
        }
        
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handlePlaybackEnd),
            name: .AVPlayerItemDidPlayToEndTime,
            object: nil
        )
    }
    
    private func setupRemoteTransportControls() {
        // Set up remote control event handling
        let commandCenter = MPRemoteCommandCenter.shared()
        
        commandCenter.playCommand.addTarget { [weak self] _ in
            self?.player?.play()
            return .success
        }
        
        commandCenter.pauseCommand.addTarget { [weak self] _ in
            self?.player?.pause()
            return .success
        }
        
        commandCenter.nextTrackCommand.addTarget { [weak self] _ in
            // Handle next track
            return .success
        }
        
        commandCenter.previousTrackCommand.addTarget { [weak self] _ in
            // Handle previous track
            return .success
        }
    }
    
    private func cleanupPlayer() {
        player?.pause()
        NotificationCenter.default.removeObserver(self)
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
    
    private func getTrackMetadata(from item: AVPlayerItem) -> [String: Any] {
        if let metadata = objc_getAssociatedObject(item, &AssociatedKeys.metadata) as? [String: Any] {
            return metadata
        }
        
        // Fallback: return basic info if metadata is not available
        var track: [String: Any] = [:]
        if let asset = item.asset as? AVURLAsset {
            track["uri"] = asset.url.absoluteString
        }
        return track
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
}
