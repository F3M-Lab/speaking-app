import { useState, useRef, useCallback } from 'react';

interface UseAudioRecorderReturn {
  isRecording: boolean;
  audioBlob: Blob | null;
  mimeType: string;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  resetRecording: () => void;
  error: string | null;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef<string>('audio/webm');

  const getSupportedMimeType = (): string => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
    ];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return '';
  };

  const startRecording = useCallback(async () => {
    setError(null);
    setAudioBlob(null);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Route the microphone through a fresh AudioContext so the MediaRecorder
      // timestamps start from ~0 for every question. Without this, Chrome reuses
      // the global audio clock, causing q2+ to have Cluster timecodes equal to
      // the elapsed time since the first recording — making files appear to start
      // late and producing codec-parameter mismatches when sharing the init segment.
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const dest = audioCtx.createMediaStreamDestination();
      source.connect(dest);

      const mimeType = getSupportedMimeType();
      mimeTypeRef.current = mimeType || 'audio/webm';

      const recorder = new MediaRecorder(dest.stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current });
        setAudioBlob(blob);
        audioCtx.close();
        stream.getTracks().forEach((t) => t.stop());
        setIsRecording(false);
      };

      // Ensure AudioContext is running before recording starts
      if (audioCtx.state !== 'running') await audioCtx.resume();
      // Let the pipeline stabilise so the first ondataavailable always
      // contains a complete WebM init segment (avoids corrupt recordings
      // on Q2+ where the context needs a few frames to warm up)
      await new Promise(resolve => setTimeout(resolve, 100));

      // No timeslice: ondataavailable fires once on stop() with the full
      // recording including init segment — prevents the chunk-splitting
      // issue where an empty first chunk causes unplayable WebM files
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      setError('No se pudo acceder al micrófono. Verifica los permisos.');
      console.error('Microphone error:', err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  }, [isRecording]);

  const resetRecording = useCallback(() => {
    setAudioBlob(null);
    setError(null);
    chunksRef.current = [];
  }, []);

  return {
    isRecording,
    audioBlob,
    mimeType: mimeTypeRef.current,
    startRecording,
    stopRecording,
    resetRecording,
    error,
  };
}
