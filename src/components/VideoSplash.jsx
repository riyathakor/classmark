
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';

const splashVideo = require('../../assets/videos/splash.mp4');

export default function VideoSplash({ onFinish }) {
    const player = useVideoPlayer(splashVideo, (player) => {
        player.loop = false;
        player.muted = true;
        player.play();
    });

    const { isPlaying } = useEvent(player, 'playingChange', {
        isPlaying: player.playing,
    });

    useEffect(() => {
        const subscription = player.addListener('playToEnd', () => {
            onFinish();
        });

        return () => subscription.remove();
    }, [player, onFinish]);

    return (
        <View style={styles.container}>
            <VideoView
                player={player}
                style={styles.video}
                contentFit="cover"
                nativeControls={false}
                allowsFullscreen={false}
                allowsPictureInPicture={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#FFFFFF',
        zIndex: 999,
    },
    video: {
        width: '100%',
        height: '100%',
    },
});
