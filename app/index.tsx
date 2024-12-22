import { Stack, Link } from 'expo-router';

import { Button } from '~/components/Button';
import { Container } from '~/components/Container';
import { ScreenContent } from '~/components/ScreenContent';
import ImageViewer from './ImageViewer';

export default function Home() {
  const image = 
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIgV48NivPInMRR7byv2XByPVbXpfWE91hedReSjYN-k0CfT4TYvjkvYRBb7GIZPlp-rw&usqp=CAU';
  return (
    <>
      <Stack.Screen options={{ title: 'Home' }} />
      <ImageViewer image={image}/>
    </>
  );
}
