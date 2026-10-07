import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useEventListener } from 'expo';
import { VideoView, useVideoPlayer } from 'expo-video';

const logoVideo = require('../assets/KrunalLogo.mp4');

export default function SplashScreen() {
    const router = useRouter();

    const player = useVideoPlayer(logoVideo, (player) => {
        player.loop = false;
        player.play();
    });

    useEventListener(player, 'playToEnd', () => {
        router.replace('/login');
    });

    return (
        <View style={styles.container}>
            <VideoView
                player={player}
                style={styles.video}
                contentFit="contain"
                nativeControls={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },

    video: {
        width: '100%',
        height: '100%',
    },
});