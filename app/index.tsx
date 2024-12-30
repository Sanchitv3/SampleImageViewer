import { Stack, Link } from 'expo-router';

import { Button } from '~/components/Button';
import { Container } from '~/components/Container';
import { ScreenContent } from '~/components/ScreenContent';
import ImageViewer from './ImageViewer';
import { Image } from 'react-native';

export default function Home() {
  const Images = ['https://images.unsplash.com/photo-1726221439759-7e7c446a2e63?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'https://www.shutterstock.com/image-photo/calm-weather-on-sea-ocean-600nw-2212935531.jpg']
  return (
    <>
      <Stack.Screen options={{ title: 'Home' }} />
      <ImageViewer Images={Images} renderItems={(image: string) => (
        <Image source={{ uri: image }} className='w-full h-full' resizeMode='contain'/>
      )}/>
    </>
  );
}
