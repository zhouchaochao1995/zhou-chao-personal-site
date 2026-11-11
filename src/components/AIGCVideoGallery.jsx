import { useRef, useState } from 'react';
import { Play } from 'lucide-react';

const videos = [
  'MiniMax_H3_00020_',
  'MiniMax_H3_00008_',
  'MiniMax_H3_00009_',
  'MiniMax_H3_00010_',
  'MiniMax_H3_00007_',
  'MiniMax_H3_00016_',
  'MiniMax_H3_00017_',
  'MiniMax_H3_00018_',
].map((file) => ({
  src: `/videos/aigc-animation/${file}.mp4`,
  poster: `/videos/aigc-animation/${file}.jpg`,
})).concat({
  src: '/videos/hero-background.mp4',
  poster: '/videos/aigc-animation/YZ_H3__00006-audio.jpg',
});

export default function AIGCVideoGallery() {
  const videoRefs = useRef([]);
  const [playingIndex, setPlayingIndex] = useState(-1);

  const playVideo = (index) => {
    videoRefs.current.forEach((video, videoIndex) => {
      if (!video || videoIndex === index) return;
      video.pause();
      video.currentTime = 0;
    });

    const video = videoRefs.current[index];
    if (!video) return;
    const playback = video.play();
    if (playback?.then) {
      playback.then(() => setPlayingIndex(index)).catch(() => setPlayingIndex(-1));
    } else {
      setPlayingIndex(index);
    }
  };

  const resetVideo = (index) => {
    const video = videoRefs.current[index];
    if (video) video.currentTime = 0;
    setPlayingIndex(-1);
  };

  return (
    <div className="aigc-video-gallery" role="group" aria-label="AI动画视频作品">
      {videos.map((item, index) => (
        <article className={`aigc-video-card${playingIndex === index ? ' is-playing' : ''}`} key={item.src}>
          <video
            ref={(node) => { videoRefs.current[index] = node; }}
            className="aigc-video"
            src={item.src}
            poster={item.poster}
            preload="none"
            playsInline
            controls={playingIndex === index}
            onEnded={() => resetVideo(index)}
            aria-label={`AI动画作品 ${String(index + 1).padStart(2, '0')}`}
          />
          {playingIndex !== index && (
            <button
              className="aigc-video-play"
              type="button"
              onClick={() => playVideo(index)}
              aria-label={`播放 AI动画作品 ${String(index + 1).padStart(2, '0')}`}
            >
              <Play size={23} strokeWidth={1.8} fill="currentColor" aria-hidden="true" />
            </button>
          )}
        </article>
      ))}
    </div>
  );
}
