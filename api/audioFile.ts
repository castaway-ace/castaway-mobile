export interface AudioFile {
    storageKey: string,
    format: string,
    bitrate: number | null,
    sampleRate: number| null,
    fileSize: string
}