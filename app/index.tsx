/* eslint-disable import/order */
import React from 'react';
import { Image, TouchableOpacity, SafeAreaView } from 'react-native';
import ImageViewer from '../components/ImageViewer';
import ImageViewer2 from '~/components/ImageViewer2';

const Images = [
  {
    id: 1,
    imgUrl:
      'https://images.unsplash.com/photo-1726221439759-7e7c446a2e63?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 2,
    imgUrl:
      'https://www.shutterstock.com/image-photo/calm-weather-on-sea-ocean-600nw-2212935531.jpg',
  },
];

export default function Home() {
  const [showModal, setShowModal] = React.useState(false);
  return (
    <>
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'aqua',
        }}>
        <TouchableOpacity onPress={() => setShowModal(true)}>
          <Image source={{ uri: Images[0].imgUrl }} resizeMode="contain" width={200} height={200} />
        </TouchableOpacity>

        <ImageViewer2
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
          }}
          images={Images}
          renderImages={(item: any) => (
            <Image
              source={{ uri: item.imgUrl }}
              key={item.id}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
          )}
        />
      </SafeAreaView>
    </>
  );
}
