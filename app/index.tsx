import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

export default function Home() {
  return (
    <View style={styles.container}>
      <Text>This is the HomePage for SoulMegle Mobile Application.</Text>
      <Text>Coming Super Soon.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
})