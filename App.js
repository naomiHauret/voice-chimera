import React, { PureComponent, Fragment } from 'react'
import { Image, Easing, Platform, Dimensions, StyleSheet, View, Animated, BackHandler } from 'react-native'
import { Asset, Font,  SplashScreen } from 'expo'
import { Provider as ReduxProvider } from 'react-redux'
import NativeTachyons from 'react-native-style-tachyons'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from 'store'
import App from 'screens/App'
import { customStyles, colors } from 'styles'
import { purgeStoredState } from 'redux-persist'
import * as Animatable from 'react-native-animatable'
import { wrap } from 'react-native-style-tachyons'

console.disableYellowBox = true
// Styles
NativeTachyons.build({
  rem: 18,
  clsPropName: "cls",
  colors: {
    palette: {
      ...colors,
    }
  },
  customStyles: {
    ...customStyles,
  }
}, StyleSheet)

// persistor.purge() uncomment this to empty your localstorage

export default wrap (
  class Khimera extends PureComponent {
  state = {
    ready: false,
    splashAnimation: new Animated.Value(0),
    splashAnimationComplete: false,
  }

  componentDidMount() {
    this._loadAsync()
    Platform.OS === 'android' && BackHandler.addEventListener('hardwareBackPress', () => true)
  }

  _loadAsync = async () => {
    try {
      await this._loadResourcesAsync()
    } catch (e) {
      console.warn(e)
    } finally {
      this._handleFinishLoading()
    }
  }

  _loadResourcesAsync = async () => {
    return Promise.all([
      Asset.loadAsync([
        require('./assets/splash.png'),
        require('./assets/images/permission.png'),
        require('./assets/images/pairing.png'),
        require('./assets/images/success.png'),
        require('./assets/images/intro.png'),
        require('./assets/images/profiles.png'),
        require('./assets/images/emotion.png'),
        require('./assets/images/translate.png'),
        require('./assets/images/learn.png'),
        require('./assets/images/data.png'),
        require('./assets/images/empty_data.png'),
      ]),
      Font.loadAsync({
        'text': require('./assets/fonts/Lato-Regular.ttf'),
        'textItalic': require('./assets/fonts/Lato-Italic.ttf'),
        'textBold': require('./assets/fonts/Lato-Bold.ttf'),
        'textLogo': require('./assets/fonts/Dosis-Regular.ttf'),
      }),
    ])
  }

  _handleFinishLoading = () => {
    this.setState({ ready: true })
  }

  _animateOut = () => {
      SplashScreen.hide()
      Animated.timing(this.state.splashAnimation, {
        toValue: Dimensions.get('window').width * -1,
        duration: 750,
        useNativeDriver: true,
      }).start(() => {
        this.setState({ splashAnimationComplete: true });
      })
    }

  _handleAnimatableSplashRef = ref => this.view = ref

  _maybeRenderLoadingImage = () => {
    if (this.state.splashAnimationComplete) {
      return null
  }

    return (
      <Animated.View
        cls="absolute bg-yellow-100 aic jcc "
        style={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          backgroundColor: '#F5FF86',
          opacity: this.state.splashAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0],
          }),
          transform: [{
            translateX: this.state.splashAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [-1, 0],
            }),
          }]
        }}>
        <Animated.Image
          source={require('./assets/splash.png')}
          style={{
            width: undefined,
            height: undefined,
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            resizeMode: 'contain',
            transform: [{
            scale: this.state.splashAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0]
            }),
          }]
          }}
          onLoadEnd={this._animateOut}
        />
      </Animated.View>
    )
  }

  render() {
    if (this.state.ready === false ) {
      return <View />
    }
    return (
      <View cls="flx-i">
        <ReduxProvider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <App />
          </PersistGate>
        </ReduxProvider>
        {this._maybeRenderLoadingImage()}
      </View>
    )
  }
}
)