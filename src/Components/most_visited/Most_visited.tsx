import React, { useRef, useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { styles } from '../../styles/Most_VisitedStyle';

const CARD_WIDTH = 280;

interface Destination {
    _id: string;
    nombre: string;
    rank: number;
    count: number;
    image?: string;
}

interface Props {
    navigation: any;
}

const Most_visited = ({ navigation }: Props) => {
    const scrollViewRef = useRef<ScrollView>(null);
    const [activeSlide, setActiveSlide] = useState(0);
    const [destinations, setDestinations] = useState<Destination[]>([]);

    useEffect(() => {
        fetchMostVisited();
    }, []);

    const fetchMostVisited = async () => {
        try {
            console.log('MostVisited: haciendo fetch...');
            const response = await fetch('https://uteq-connect-server-production.up.railway.app/api/most-visited');
            const data = await response.json();

            console.log('MostVisited: total recibidos:', data.length);
            console.log('MostVisited: datos completos:', JSON.stringify(data, null, 2));
            data.forEach((d: Destination) => {
                console.log(`MostVisited: [${d.rank}] ${d.nombre} → image: ${d.image ?? 'SIN IMAGEN'}`);
            });

            setDestinations(data);
        } catch (error) {
            console.error('MostVisited: error ❌', error);
        }
    };

    const getImageUrl = (image?: string) => {
        if (!image) {
            console.log('getImageUrl: image es null/undefined');
            return null;
        }
        const url = image.startsWith('http')
            ? image
            : `https://uteq-connect-server-production.up.railway.app/${image}`;
        console.log('getImageUrl:', url);
        return url;
    };

    const handleScroll = (event: any) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / (CARD_WIDTH + 16));
        setActiveSlide(index);
    };

    const handleNavigateToDestination = (destination: Destination) => {
        navigation.navigate('MapTab', { destination });
    };

    return (
        <View style={styles.sliderSection}>
            <Text style={styles.sectionTitle}>Más Visitados</Text>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
                snapToInterval={CARD_WIDTH + 16}
                snapToAlignment="center"
                contentContainerStyle={styles.sliderContent}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                {destinations.map((destination, index) => {
                    const imageUrl = getImageUrl(destination.image);

                    return (
                        <View
                            key={destination._id}
                            style={[styles.destinationCard, index === 0 && styles.firstCard]}
                        >
                            <View style={styles.cardImageContainer}>
                                {imageUrl ? (
                                    <Image
                                        source={{ uri: imageUrl }}
                                        style={styles.cardImage}
                                        resizeMode="cover"
                                        onError={(error) => console.log(`❌ Error imagen [${destination.nombre}]:`, error.nativeEvent.error)}
                                        onLoad={() => console.log(`✅ Imagen cargada [${destination.nombre}]:`, imageUrl)}
                                    />
                                ) : (
                                    <View style={styles.cardImagePlaceholder}>
                                        <Text style={{ fontSize: 16, color: '#999', fontWeight: '600' }}>
                                            SIN IMAGEN
                                        </Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle} numberOfLines={2}>
                                    {destination.nombre}
                                </Text>

                                <TouchableOpacity
                                    style={styles.cardButton}
                                    onPress={() => handleNavigateToDestination(destination)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.cardButtonText}>Ver Ruta</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                })}
            </ScrollView>

            <View style={styles.pagination}>
                {destinations.map((_, index) => (
                    <View
                        key={index}
                        style={[styles.dot, index === activeSlide && styles.dotActive]}
                    />
                ))}
            </View>
        </View>
    );
};

export default Most_visited;