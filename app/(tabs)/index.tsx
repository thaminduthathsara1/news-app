import {ActivityIndicator, Animated, RefreshControl, ScrollView, StyleSheet, Text, View} from 'react-native'
import React, {useCallback, useEffect, useState} from 'react'
import {useSafeAreaInsets} from "react-native-safe-area-context";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import axios from "axios";
import {NewsDataType} from "@/types";
import BreakingNews from "@/components/BreakingNews";
import Categories from "@/components/Categories";
import NewsList from "@/components/NewsList";
import Loading from "@/components/Loading";
import {Ionicons} from "@expo/vector-icons";
import {Colors} from "@/constants/Colors";
import {FadeInDown} from "react-native-reanimated";
import {StatusBar} from "expo-status-bar";

type Props = {}

const Page = (props: Props) => {
  const {top: safeTop} = useSafeAreaInsets();
  const [breakingNews, setBreakingNews] = useState<NewsDataType[]>([]);
  const [news, setNews] = useState<NewsDataType[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("");
  // const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
        getBreakingNews();
        getNews();
  }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        Promise.all([getBreakingNews(), getNews(activeCategory)])
            .finally(() => setRefreshing(false));
    }, [activeCategory]);

  const getBreakingNews = async () => {
    try {
      const url = `https://newsdata.io/api/1/news?apikey=${process.env.EXPO_PUBLIC_API_KEY}&country=af&language=en&image=1&removeduplicate=1&size=5`;
      const response = await axios.get(url);

      console.log(response.data);
      if (response && response.data) {
          setBreakingNews(response.data.results);
          setIsLoading(false);
      }
    }catch (err: any) {
      console.log('Error Message: ', err.message);
      setIsLoading(false);
    }
  };

    const getNews = async (category:string = '') => {
        try {
            let  categoryString = '';
            if ( category.length  !== 0 ) {
                categoryString = `&category=${category}`
            }

            const url = `https://newsdata.io/api/1/news?apikey=${process.env.EXPO_PUBLIC_API_KEY}&country=af&language=en&image=1&removeduplicate=1&size=10${categoryString}`;
            const response = await axios.get(url);

            console.log(response.data);
            if (response && response.data) {
                setNews(response.data.results);
                setIsLoading(false);
            }

        }catch (err: any) {
            console.log('Error Message: ', err.message);
            setIsLoading(false);
        }
    };

  const onCatChanged = (category: string = '') => {
      console.log('Category: ', category);
      setNews([]);
      getNews(category);
  }

    const renderEmptyState = () => {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="newspaper-outline" size={48} color={Colors.tint || "#FF6B6B"} />
                <Text style={styles.emptyTitle}>No News Found</Text>
                <Text style={styles.emptyText}>
                    We couldn't find any news matching your criteria. Try another category or check your connection.
                </Text>
            </View>
        );
    };

  return (
      <View style={styles.wrapper}>
          <StatusBar style="dark" />
          <ScrollView
              style={[styles.container, { paddingTop: safeTop }]}
              refreshControl={
                  <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                      tintColor={Colors.tint || "#FF6B6B"}
                      colors={[Colors.tint || "#FF6B6B"]}
                  />
              }
          >
              <Header />
              {/*<SearchBar withHorizontalPadding={true} setSearchQuery={setSearchQuery} />*/}

              <Animated.View entering={FadeInDown.delay(200).duration(500)}>
                  <View style={styles.sectionHeader}>
                      <Ionicons name="flash" size={20} color={Colors.tint || "#FF6B6B"} />
                      <Text style={styles.sectionTitle}>Breaking News</Text>
                  </View>
                  {isLoading ? (
                      <Loading size={'large'} />
                  ) : (
                      <BreakingNews newsList={breakingNews} />
                  )}
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(400).duration(500)}>
                  <View style={styles.sectionHeader}>
                      <Ionicons name="grid-outline" size={20} color={Colors.tint || "#FF6B6B"} />
                      <Text style={styles.sectionTitle}>Categories</Text>
                  </View>
                  <Categories onCategoryChanged={onCatChanged} activeCategory={activeCategory} />
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(600).duration(500)} style={styles.newsListContainer}>
                  <View style={styles.sectionHeader}>
                      <Ionicons name="newspaper-outline" size={20} color={Colors.tint || "#FF6B6B"} />
                      <Text style={styles.sectionTitle}>
                          {activeCategory ? `${activeCategory} News` : 'Latest News'}
                      </Text>
                  </View>
                  {isLoading ? (
                      <Loading size={'large'} />
                  ) : news.length > 0 ? (
                      <NewsList newsList={news} />
                  ) : (
                      renderEmptyState()
                  )}
              </Animated.View>

              <View style={styles.footer}>
                  <Text style={styles.footerText}>NewsPulse • Bringing you stories that matter</Text>
              </View>
          </ScrollView>
      </View>
          )
}

export default Page

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    container: {
        flex: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 6,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        letterSpacing: 0.5,
    },
    newsListContainer: {
        flex: 1,
        marginBottom: 20,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
        marginVertical: 20,
        backgroundColor: 'white',
        marginHorizontal: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        marginTop: 12,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
    },
    footer: {
        paddingVertical: 20,
        alignItems: 'center',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#E5E7EB',
        marginHorizontal: 16,
    },
    footerText: {
        fontSize: 12,
        color: '#9CA3AF',
        letterSpacing: 0.3,
    },
});
