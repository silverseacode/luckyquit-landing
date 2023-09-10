"use client"
import styles from "../page.module.css";

const VideoFaqQuitters1 = () => {
    return(
        <video controls style={{zIndex: 2, position: 'relative', marginBottom: 40}} className={styles.videoFaq} muted autoPlay loop width="500" height="500">
        <source src="/how does tracking feature work.mp4" type="video/mp4" />
      </video>
    )
}

export default VideoFaqQuitters1