import { Component, PropsWithChildren } from 'react'
import { AppStoreProvider } from '@/store/AppStore'
import './app.scss'

class App extends Component<PropsWithChildren> {
  componentDidMount() {}
  componentDidShow() {}
  componentDidHide() {}
  render() {
    return (
      <AppStoreProvider>
        {this.props.children}
      </AppStoreProvider>
    )
  }
}

export default App
