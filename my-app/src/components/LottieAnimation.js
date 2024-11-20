// src/components/LottieAnimation.js
import React from 'react';
import { Lottie } from 'lottie-react';
import animationData from '../assets/homepage-logo.json'; // Update this path

const LottieAnimation = () => {
    return <Lottie animationData={animationData} loop={true} />;
};

export default LottieAnimation;
