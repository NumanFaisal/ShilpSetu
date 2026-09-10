import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MessageCircle, Share2, ShoppingBag, X } from 'lucide-react-native';
import { Header } from '../../../components/ui/Header';
import { Button } from '../../../components/ui/Button';
import { AIBadge } from '../../../components/ui/AIBadge';
import { Card } from '../../../components/ui/Card';
import { getProductById, createOrder } from '../../../services/api';
import { PRODUCT } from '../../../mocks/seed';

export default function BuyerProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<any>(PRODUCT);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  // Quick order modal state
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState('1');
  const [deliveryAddress, setDeliveryAddress] = useState('124 Connaught Place, New Delhi, 110001');
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    let isMounted = true;

    async function load() {
      try {
        const data = await getProductById(id, { signal: controller.signal });
        if (isMounted && data) {
          const rawImages = Array.isArray(data.images) ? data.images : [];
          const imageUrls = rawImages.map((img: any) =>
            typeof img === 'string' ? img : img?.outputSquareUrl || img?.originalUrl || img?.url
          ).filter(Boolean);

          setProduct({
            ...data,
            images: imageUrls.length > 0 ? imageUrls : PRODUCT.images,
            certifications: Array.isArray(data.certifications) ? data.certifications : ['GI Tagged', '100% Handloom'],
            price: Number(data.price) || 1200,
            artisanName: data.artisanName || data.artisan?.storeName || 'Master Craftsman',
            artisanLocation: data.artisanLocation || data.artisan?.state || 'Varanasi, UP',
            artisanExperience: data.artisanExperience || 18,
            aiDescription: data.aiDescription || data.description || 'Authentic handcrafted heritage artwork.',
            material: data.material || 'Natural Handspun Thread',
            size: data.size || '32 x 45 cm',
            weight: data.weight || '450g',
            origin: data.origin || data.artisan?.state || 'India',
            craftType: data.craftType || 'Traditional Handcraft',
            moq: data.moq || 1,
          });
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('[BuyerProductDetail] load error:', err.message);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [id]);

  const handlePlaceOrder = async () => {
    const qty = parseInt(orderQuantity, 10);
    if (isNaN(qty) || qty < 1) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity of 1 or more.');
      return;
    }

    try {
      setPlacingOrder(true);
      const prodNumId = Number(id) || 1;
      const order = await createOrder({
        productId: prodNumId,
        quantity: qty,
        deliveryAddress: deliveryAddress.trim(),
      });

      setOrderModalVisible(false);
      Alert.alert(
        'Order Placed!',
        `Your order ${order?.displayId || ''} for ${qty} unit(s) has been successfully created.`,
        [
          {
            text: 'View My Orders',
            onPress: () => router.push('/(buyer)/orders' as any),
          },
          { text: 'OK' },
        ]
      );
    } catch (err: any) {
      Alert.alert('Order Failed', err.message || 'Could not place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
        <Header title="Product Details" showBack />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#B5502F" />
        </View>
      </SafeAreaView>
    );
  }

  const images = Array.isArray(product.images) && product.images.length > 0 ? product.images : PRODUCT.images;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
      <Header title="Product Details" showBack />
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View>
          <Image
            source={{ uri: images[activeImage] || images[0] }}
            style={{ width: '100%', height: 280, backgroundColor: '#F6EEDF' }}
            resizeMode="cover"
          />
          {images.length > 1 && (
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, position: 'absolute', bottom: 12, left: 0, right: 0 }}>
              {images.map((_: any, i: number) => (
                <TouchableOpacity key={i} onPress={() => setActiveImage(i)}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: i === activeImage ? '#5B6E4E' : 'rgba(255,255,255,0.7)' }} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 20, gap: 20 }}>
          {/* Category + certifications */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#8A726B', textTransform: 'uppercase', letterSpacing: 0.8 }}>
              {product.category || 'Handicrafts'}
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(product.certifications || []).slice(0, 2).map((c: string) => (
                <View key={c} style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 9999, backgroundColor: 'rgba(91,110,78,0.1)', borderWidth: 1, borderColor: '#5B6E4E' }}>
                  <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: '#5B6E4E' }}>{c}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Name + Price */}
          <View style={{ gap: 8 }}>
            <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 26, color: '#2B2420', lineHeight: 32 }}>{product.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 28, color: '#2B2420' }}>
                ₹{Number(product.price).toLocaleString('en-IN')}
              </Text>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#8A726B' }}>/ unit</Text>
            </View>
          </View>

          {/* Artisan info */}
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#F6EEDF', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 20 }}>🧶</Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 15, color: '#2B2420' }}>{product.artisanName}</Text>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#56423C' }}>
                  {product.artisanLocation} · {product.artisanExperience} yrs exp
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/chat/thread-001' as any)}
                style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#F6EEDF', borderWidth: 1, borderColor: '#E4D8C3', alignItems: 'center', justifyContent: 'center' }}
              >
                <MessageCircle size={16} color="#5B6E4E" strokeWidth={1.5} />
              </TouchableOpacity>
            </View>
          </Card>

          {/* AI Description */}
          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 18, color: '#2B2420' }}>About this Craft</Text>
              <AIBadge label="AI Written" />
            </View>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: '#56423C', lineHeight: 22 }}>
              {product.aiDescription}
            </Text>
          </View>

          {/* Details */}
          <Card>
            <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 16, color: '#2B2420', marginBottom: 14 }}>Specifications</Text>
            {[
              { key: 'Material', value: product.material },
              { key: 'Dimensions', value: product.size },
              { key: 'Weight', value: product.weight },
              { key: 'Origin', value: product.origin },
              { key: 'Craft Technique', value: product.craftType },
              { key: 'Min Order Qty', value: `${product.moq} unit(s)` },
            ].map((d) => (
              <View key={d.key} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#8A726B' }}>{d.key}</Text>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: '#2B2420' }}>{d.value || 'Handmade'}</Text>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>

      {/* Bottom CTA Bar */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFDF8', borderTopWidth: 1, borderTopColor: '#E4D8C3', paddingHorizontal: 20, paddingVertical: 14, flexDirection: 'row', gap: 10, alignItems: 'center' }}>
        <TouchableOpacity
          style={{ width: 44, height: 44, borderRadius: 8, borderWidth: 1, borderColor: '#E4D8C3', alignItems: 'center', justifyContent: 'center' }}
        >
          <Share2 size={20} color="#2B2420" strokeWidth={1.5} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/bulk-request')}
          style={{ flex: 1, height: 48, borderRadius: 8, borderWidth: 1.5, borderColor: '#5B6E4E', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFDF8' }}
        >
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#5B6E4E' }}>Bulk Quote</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setOrderModalVisible(true)}
          style={{ flex: 1, height: 48, borderRadius: 8, backgroundColor: '#B5502F', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 }}
        >
          <ShoppingBag size={16} color="#FFFFFF" />
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#FFFFFF' }}>Buy Now</Text>
        </TouchableOpacity>
      </View>

      {/* Order Placement Modal */}
      <Modal visible={orderModalVisible} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#FFFDF8', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, gap: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 20, color: '#2B2420' }}>Confirm Your Order</Text>
              <TouchableOpacity onPress={() => setOrderModalVisible(false)} hitSlop={8}>
                <X size={20} color="#8A726B" />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 4 }}>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 15, color: '#2B2420' }}>{product.name}</Text>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#8A726B' }}>₹{product.price} each</Text>
            </View>

            <View style={{ gap: 6 }}>
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#56423C' }}>Quantity</Text>
              <TextInput
                value={orderQuantity}
                onChangeText={setOrderQuantity}
                keyboardType="numeric"
                style={{ backgroundColor: '#FFF8F6', borderWidth: 1, borderColor: '#E4D8C3', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, fontFamily: 'Inter_500Medium', fontSize: 15, color: '#2B2420' }}
              />
            </View>

            <View style={{ gap: 6 }}>
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#56423C' }}>Delivery Address</Text>
              <TextInput
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
                multiline
                numberOfLines={2}
                style={{ backgroundColor: '#FFF8F6', borderWidth: 1, borderColor: '#E4D8C3', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, fontFamily: 'Inter_400Regular', fontSize: 14, color: '#2B2420' }}
              />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#E4D8C3' }}>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: '#8A726B' }}>Total Estimated</Text>
              <Text style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 22, color: '#B5502F' }}>
                ₹{((parseInt(orderQuantity, 10) || 1) * product.price).toLocaleString('en-IN')}
              </Text>
            </View>

            <Button
              label={placingOrder ? 'Processing...' : 'Confirm & Place Order'}
              loading={placingOrder}
              onPress={handlePlaceOrder}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
