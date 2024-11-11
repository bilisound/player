package moe.bilisound.player

import expo.modules.core.errors.CodedException

internal class TaskManagerNotFoundException :
    CodedException("Could not find the task manager")