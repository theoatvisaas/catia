LOG [13:08:27.977] [ChunkBuffer] push #5 | buffer=5/30 | b64len=46936 (~35202B) | streamPos=40810
LOG [13:08:28.780] [RecordProvider] pause() | isRecording=true
LOG [13:08:28.780] [RecordProvider] pause() | Watchdog stopped (paused)
LOG [13:08:28.793] [RecordProvider] pause() | ✅ Recording paused
LOG [13:08:28.800] [ChunkBuffer] push #6 | buffer=6/30 | b64len=34136 (~25602B) | streamPos=32014
DEBUG Recording interruption event received: {"isPaused": true, "reason": "userPaused", "timestamp": 1771085308793.28}
LOG [13:08:30.148] [RecordProvider] finish() | START | session=a6441dea-4f2c-4a25-9f2a-ccf888c22ebc | audioEvents=6 | isRecording=true | isPaused=true
LOG [13:08:30.148] [RecordProvider] finish() | Step 1: Stopping watchdog | watchdogExists=true
LOG [13:08:30.148] [RecordProvider] finish() | Step 2: Flushing remaining buffer | bufferExists=true
LOG [13:08:30.149] [ChunkBuffer] flushRemaining() | 6 items in buffer
LOG [13:08:30.149] [ChunkBuffer] FLUSH chunk #0 | 6 items | ~192009B | streamStart=0
LOG [13:08:30.149] [RecordProvider] onFlush() | chunk=#0 order=0 | 6 items | ~192009B | storagePath=dbe2a1fe-522a-4867-87bc-9fc440428ce5/recordings/a6441dea-4f2c-4a25-9f2a-ccf888c22ebc/chunk_0000.wav
LOG [13:08:30.149] [ConsultationStore] addChunk(a6441dea-4f2c-4a25-9f2a-ccf888c22ebc) | chunk=#0 order=0 | status=pending_local | ~192009B | storagePath=dbe2a1fe-522a-4867-87bc-9fc440428ce5/recordings/a6441dea-4f2c-4a25-9f2a-ccf888c22ebc/chunk_0000.wav | localFile=none
LOG [13:08:30.150] [ConsultationStore] addChunk() | totalChunks=1 | nextChunkIndex=1
LOG [13:08:30.150] [RecordProvider] onFlush() | Enqueuing chunk #0 for upload
LOG [13:08:30.151] [ChunkUpload] enqueue() | chunk=#0 order=0 | 6 items (~192009B) | queueLen=1 | halted=false
LOG [13:08:30.154] [ChunkUpload] processNext() ENTER | processing=false | queueLen=1 | sessionId=a6441dea-4f2c-4a25-9f2a-ccf888c22ebc | halted=false
LOG [13:08:30.154] [ChunkUpload] processNext() | chunk=#0 | network=wifi
LOG [13:08:30.154] [ChunkUpload] Checking auth session...
LOG [13:08:30.154] [TokenGuard] ensureValidSession() | Checking for valid access token...
LOG [13:08:30.154] [ChunkBuffer] stop() | pushCount=6 | chunkIndex=1
LOG [13:08:30.154] [RecordProvider] finish() | Step 2 DONE: flush+stop took 5ms | queueSessionId=a6441dea-4f2c-4a25-9f2a-ccf888c22ebc | queueHalted=false
LOG [13:08:30.155] [RecordProvider] finish() | Step 3: Calling stopRecording()... | isRecording=true | isPaused=true
LOG [13:08:30.200] [TokenGuard] ensureValidSession() | ✅ Valid token found (eyJhbGci...)
LOG [13:08:30.200] [ChunkUpload] Auth session OK
LOG [13:08:30.200] [ConsultationStore] updateChunkStatus(a6441dea-4f2c-4a25-9f2a-ccf888c22ebc) | chunk=#0 → uploading
LOG [13:08:30.200] [ConsultationStore] updateChunkStatus() | Chunks summary: 0✅ 1⬆️ 0📁 0❌ / 1 total
LOG [13:08:30.200] [ChunkUpload] Progress: 0/1 uploaded | 0 failed | uploading=true
LOG [13:08:30.200] [ChunkUpload] UPLOADING chunk #0 (order=0) | ~192009B | path=dbe2a1fe-522a-4867-87bc-9fc440428ce5/recordings/a6441dea-4f2c-4a25-9f2a-ccf888c22ebc/chunk_0000.wav
LOG [13:08:30.200] [ChunkUpload] chunk #0 attempt 1 | CALLING uploadChunkBase64 | sessionId=a6441dea-4f2c-4a25-9f2a-ccf888c22ebc | this.sessionId=a6441dea-4f2c-4a25-9f2a-ccf888c22ebc | this.processing=true
LOG [13:08:30.201] [UploadChunk] START | chunks=6 | bucket=recordings | path=dbe2a1fe-522a-4867-87bc-9fc440428ce5/recordings/a6441dea-4f2c-4a25-9f2a-ccf888c22ebc/chunk_0000.wav
LOG [13:08:30.227] [UploadChunk] decode took 26ms | pcmSize=192000B
LOG [13:08:30.227] [UploadChunk] wavWrap took 0ms | uploadSize=192044B
LOG [13:08:30.227] [UploadChunk] Uploading 192044B to recordings/dbe2a1fe-522a-4867-87bc-9fc440428ce5/recordings/a6441dea-4f2c-4a25-9f2a-ccf888c22ebc/chunk_0000.wav (wav=true)
LOG [13:08:30.248] [RecordProvider] finish() | Step 3 DONE: stopRecording took 93ms | durationMs=6414
LOG [13:08:30.248] [RecordProvider] finish() | Step 4: Marking consultation as finalized | duration=6414ms
LOG [13:08:30.248] [ConsultationStore] updateConsultation(a6441dea-4f2c-4a25-9f2a-ccf888c22ebc) | fields=[userFinalized, finishedAt, durationMs, hasTempBuffer]
LOG [13:08:30.248] [RecordProvider] finish() | Step 5: Waiting for upload queue to drain | timeout=30000ms | pendingChunks=1 | queueProcessing=false
LOG [13:08:30.249] [ChunkUpload] waitForDrain(30000ms) | queueLen=0 | processing=true
LOG [13:08:30.267] [UploadChunk] getAuthenticatedSupabase took 40ms
LOG [13:08:30.267] [UploadChunk] CALLING supabase.storage.upload()...
LOG [13:08:30.563] [UploadChunk] supabase.storage.upload() returned in 296ms | hasError=false | hasData=true
LOG [13:08:30.563] [UploadChunk] ✅ Uploaded: dbe2a1fe-522a-4867-87bc-9fc440428ce5/recordings/a6441dea-4f2c-4a25-9f2a-ccf888c22ebc/chunk_0000.wav
LOG [13:08:30.563] [ChunkUpload] chunk #0 attempt 1 | uploadChunkBase64 RETURNED | elapsed=363ms | this.sessionId=a6441dea-4f2c-4a25-9f2a-ccf888c22ebc | this.processing=true
LOG [13:08:30.563] [ConsultationStore] updateChunkStatus(a6441dea-4f2c-4a25-9f2a-ccf888c22ebc) | chunk=#0 → uploaded | extra=[storagePath, sizeBytes]
LOG [13:08:30.563] [ConsultationStore] updateChunkStatus() | Chunks summary: 1✅ 0⬆️ 0📁 0❌ / 1 total
LOG [13:08:30.564] [ConsultationStore] recomputeSyncStatus(a6441dea-4f2c-4a25-9f2a-ccf888c22ebc) | local → synced | chunks=1/1 uploaded | finalized=true
LOG [13:08:30.564] [ConsultationStore] setSyncStatus(a6441dea-4f2c-4a25-9f2a-ccf888c22ebc) → synced
LOG [13:08:30.565] [ChunkUpload] ✅ Chunk #0 (order=0) UPLOADED | 192009B | 363ms | path=dbe2a1fe-522a-4867-87bc-9fc440428ce5/recordings/a6441dea-4f2c-4a25-9f2a-ccf888c22ebc/chunk_0000.wav
LOG [13:08:30.565] [ChunkUpload] Progress: 1/1 uploaded | 0 failed | uploading=true
LOG [13:08:30.565] [ChunkUpload] processNext() ENTER | processing=false | queueLen=0 | sessionId=a6441dea-4f2c-4a25-9f2a-ccf888c22ebc | halted=false
LOG [13:08:30.565] [ChunkUpload] processNext() SKIP | processing=false | queueEmpty=true | noSession=false | halted=false
LOG [13:08:30.683] [ChunkUpload] waitForDrain() → drained OK (434ms)
LOG [13:08:30.683] [RecordProvider] finish() | Queue drain result: drained=true | elapsed=435ms | halted=false | haltReason=none
LOG [13:08:30.683] [RecordProvider] finish() | All chunks uploaded — calling finalizeConsultation()...
LOG [13:08:30.684] [SyncService] finalizeConsultation(a6441dea-4f2c-4a25-9f2a-ccf888c22ebc) | START
LOG [13:08:30.684] [SyncService] finalizeConsultation() | chunks: 1/1 uploaded | allUploaded=true
LOG [13:08:30.684] [SyncService] finalizeConsultation() | Upserting metadata to recording_sessions table...
LOG [13:08:30.684] [SyncService] finalizeConsultation() | Upsert data: {
"session_id": "a6441dea-4f2c-4a25-9f2a-ccf888c22ebc",
"user_id": "dbe2a1fe-522a-4867-87bc-9fc440428ce5",
"storage_bucket": "recordings",
"storage_prefix": "dbe2a1fe-522a-4867-87bc-9fc440428ce5/recordings/a6441dea-4f2c-4a25-9f2a-ccf888c22ebc",
"patient_name": null,
"guardian_name": null,
"sex": null,
"duration_ms": 6414,
"chunk_count": 1,
"status": "synced",
"finalized_at": "2026-02-14T16:08:30.684Z"
}
LOG [13:08:30.824] [SyncService] finalizeConsultation() | ✅ DB upsert OK
LOG [13:08:30.824] [SyncService] finalizeConsultation() | Deleting local chunk files for session a6441dea-4f2c-4a25-9f2a-ccf888c22ebc...
LOG [13:08:30.825] [ChunkStorage] deleteSessionChunks() | session=a6441dea-4f2c-4a25-9f2a-ccf888c22ebc | dir=file:///var/mobile/Containers/Data/Application/0DB249F0-BB85-4621-A07E-D8CBDDD16827/Documents/chunks/a6441dea-4f2c-4a25-9f2a-ccf888c22ebc/
LOG [13:08:30.829] [ChunkStorage] deleteSessionChunks() | ✅ Session directory deleted
LOG [13:08:30.829] [SyncService] finalizeConsultation() | Local files deleted
LOG [13:08:30.829] [ConsultationStore] updateConsultation(a6441dea-4f2c-4a25-9f2a-ccf888c22ebc) | fields=[syncStatus, lastSyncedAt, hasTempBuffer]
LOG [13:08:30.830] [SyncService] finalizeConsultation(a6441dea-4f2c-4a25-9f2a-ccf888c22ebc) | ✅ DONE — consultation synced
LOG [13:08:30.854] [RecordProvider] finish() | ✅ Consultation FINALIZED as synced
LOG [13:08:30.854] [RecordProvider] finish() | Step 6: Cleaning up refs
LOG [13:08:30.855] [ChunkUpload] clearSession() | was=a6441dea-4f2c-4a25-9f2a-ccf888c22ebc | queueLen=0 | processing=false | halted=false
LOG [13:08:30.855] [ChunkUpload] clearSession() DONE | sessionId=null | processing=false
LOG [13:08:30.855] [ChunkBuffer] reset()
LOG [13:08:30.856] [RecordProvider] finish() | ✅ DONE
