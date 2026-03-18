import { useEffect, useRef } from "react";
import {
    Animated,
    Image,
    StyleSheet
} from "react-native";

interface Props {
  onFinish: () => void;
}

export default function SplashAnimation({ onFinish }: Props) {
  const bgOpacity    = useRef(new Animated.Value(0)).current;
  const logoScale    = useRef(new Animated.Value(0.3)).current;
  const logoOpacity  = useRef(new Animated.Value(0)).current;
  const textOpacity  = useRef(new Animated.Value(0)).current;
  const textY        = useRef(new Animated.Value(30)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([

      // Phase 1: Dark background fade in
      Animated.timing(bgOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),

      // Phase 2: Pokeball logo spring ke saath aaye
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 4,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),

      // Phase 3: "Pokédex" text slide up
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(textY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),

      // Phase 4: Subtitle fade in
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),

      // Phase 5: 1.2 sec ruko
      Animated.delay(1200),

      // Phase 6: Sab fade out
      Animated.parallel([
        Animated.timing(bgOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(subtitleOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),

    ]).start(() => {
      onFinish(); // parent ko batao — list dikhao ab
    });
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: bgOpacity }]}>

      {/* Pokeball Logo */}
      <Animated.View
        style={{
          transform: [{ scale: logoScale }],
          opacity: logoOpacity,
          marginBottom: 32,
        }}
      >
        <Image
          source={require("../../assets/images/icon.png")}
          style={styles.logo}
        />
      </Animated.View>

      {/* Pokedex Title */}
      <Animated.Text
        style={[
          styles.title,
          {
            opacity: textOpacity,
            transform: [{ translateY: textY }],
          },
        ]}
      >
        Pokédex
      </Animated.Text>

      {/* Subtitle */}
      <Animated.Text
        style={[styles.subtitle, { opacity: subtitleOpacity }]}
      >
        Gotta catch 'em all
      </Animated.Text>

    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0a0a0a",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  logo: {
    width: 130,
    height: 130,
    resizeMode: "contain",
  },
  title: {
    color: "#ffffff",
    fontSize: 44,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 3,
  },
  subtitle: {
    color: "#888888",
    fontSize: 15,
    textAlign: "center",
    marginTop: 10,
    letterSpacing: 1.5,
  },
});