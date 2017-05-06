import {
    Platform,
} from 'react-native'

import AndroidPullToRefreshListView from './PullToRefreshListView-android'
import IOSPullToRefreshListView from './PullToRefreshListView-ios'

let PullToRefreshListView

if(Platform.OS == 'ios') {
    PullToRefreshListView = IOSPullToRefreshListView
}
else {
    PullToRefreshListView = AndroidPullToRefreshListView
}

export default PullToRefreshListView