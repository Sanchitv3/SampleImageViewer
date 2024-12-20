import '../global.css';

import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";

import { Stack } from 'expo-router';

export default function Layout() {
  return <GluestackUIProvider mode="light"><Stack /></GluestackUIProvider>;
}
