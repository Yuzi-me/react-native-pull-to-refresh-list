# react-native-pull-to-refresh-list

[![npm](https://img.shields.io/npm/v/react-native-pull-to-refresh-list.svg)](https://www.npmjs.com/package/react-native-pull-to-refresh-list)
[![npm](https://img.shields.io/npm/dm/react-native-pull-to-refresh-list.svg)](https://www.npmjs.com/package/react-native-pull-to-refresh-list)
[![npm](https://img.shields.io/npm/dt/react-native-pull-to-refresh-list.svg)](https://www.npmjs.com/package/react-native-pull-to-refresh-list)
[![npm](https://img.shields.io/npm/l/react-native-pull-to-refresh-list.svg)](https://github.com/react-native-component/react-native-pull-to-refresh-listview/blob/master/LICENSE)

React Native 下拉刷新和上拉加载，IOS是用纯JS编写；Android是用纯JS和Java编写。解决了Android listview大数据下拉刷新效果体验。

此组件目前测试通过版本为 React Native 0.43，其他 React Native 各个版本暂未测试，望各位高手遇到兼容性问题，留言或者提问给我，我愿与你一起解决问题。

## DEMO
<div>
<img src="https://github.com/Yuzi-me/react-native-pull-to-refresh-list-demo/raw/master/src/img/ios.gif" alt="" width="40%">
<img src="https://github.com/Yuzi-me/react-native-pull-to-refresh-list-demo/raw/master/src/img/android.gif" alt="" width="42.75%%">
</div>


## 安装

```
npm install react-native-pull-to-refresh-list --save
```


## 命令行配置 (Android)

```
react-native link react-native-pull-to-refresh-list
```

运行以上命令，还需要手动配置以下文件

* In `android/settings.gradle`
```
...
maven {
    url "$rootDir/../node_modules/react-native/android"
}
maven { url "https://jitpack.io" }  //used for react-native-pull-to-refresh-list
```


## 手动配置 (Android)

* In `android/settings.gradle`

```
...
include ':react-native-pull-to-refresh-list'
project(':react-native-pull-to-refresh-list').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-pull-to-refresh-list/android')
```

* In `android/build.gradle`

```
...
maven {
    url "$rootDir/../node_modules/react-native/android"
}
maven { url "https://jitpack.io" }  //used for react-native-pull-to-refresh-list
```


* In `android/app/build.gradle`

```
...
dependencies {
    ...
    // From node_modules
    compile project(':react-native-pull-to-refresh-list')
}
```

* In MainApplication.java

```
...
import com.reactnativepulltorefresh.AppReactPackage;    //import package
...
/**
 * A list of packages used by the app. If the app uses additional views
 * or modules besides the default ones, add more packages here.
 */
@Override
protected List<ReactPackage> getPackages() {
    return Arrays.<ReactPackage>asList(
        new MainReactPackage(),
        new AppReactPackage()  //register Module
    );
}
...

```


## 案例

see [react-native-pull-to-refresh-list-demo][0]



## 用法

```js
import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  StatusBar,
  ScrollView,
  ListView,
  Image,
  ActivityIndicator,
  ProgressBarAndroid,
  ActivityIndicatorIOS,
  Platform,
  ToolbarAndroid
} from 'react-native'
import NavBar from './Navbar'
import PullToRefreshListView from 'react-native-pull-to-refresh-list'

class SmartPullToRefreshListView extends Component {

  // 构造 
  constructor(props) {
    super(props);

    this._dataSource = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      //sectionHeaderHasChanged: (s1, s2) => s1 !== s2, 
    });

    let dataList = []

    this.state = {
      first: true,
      dataList: dataList,
      dataSource: this._dataSource.cloneWithRows(dataList),
    }
  }

  componentDidMount() {
    this._pullToRefreshListView.beginRefresh()
  }

  //Using ListView 
  render() {
    let component = <PullToRefreshListView
      ref={(component) => this._pullToRefreshListView = component}
      viewType={PullToRefreshListView.constants.viewType.listView}
      contentContainerStyle={{}}
      style={{ flex: 1 }}
      initialListSize={20}
      enableEmptySections={true}
      dataSource={this.state.dataSource}
      pageSize={20}
      renderRow={this._renderRow}
      renderHeader={this._renderHeader}
      renderFooter={this._renderFooter}
      //renderSeparator={(sectionID, rowID) => <View style={style.separator} />} 
      onRefresh={this._onRefresh}
      onLoadMore={this._onLoadMore}
      pullUpDistance={35}
      pullUpStayDistance={50}
      pullDownDistance={35}
      pullDownStayDistance={50}
      autoLoadMore={true}
    />


    return (
      <View style={style.container}>
        {component}
      </View>

    )

  }

  _renderRow = (rowData, sectionID, rowID) => {
    return (
      <View style={style.thumbnail}>
        <Text>{rowData.text}</Text>
      </View >
    )
  }

  _renderHeader = (viewState) => {
    let { pullState, pullDistancePercent } = viewState
    let { refresh_none, refresh_idle, will_refresh, refreshing, } = PullToRefreshListView.constants.viewState
    pullDistancePercent = Math.round(pullDistancePercent * 100)
    switch (pullState) {
      case refresh_none:
        return (
          <View style={style.pull_down_refresh}>
            <Text style={style.pull_color}>刷新成功</Text>
          </View>
        )
      case refresh_idle:
        return (
          <View style={style.pull_down_refresh}>
            <Text style={style.pull_color}>下拉刷新{pullDistancePercent}%</Text>
          </View>
        )
      case will_refresh:
        return (
          <View style={style.pull_down_refresh}>
            <Text style={style.pull_color}>释放立即刷新{pullDistancePercent > 100 ? 100 : pullDistancePercent}%</Text>
          </View>
        )
      case refreshing:
        return (
          <View style={style.pull_down_refresh}>
            {this._renderActivityIndicator()}<Text style={style.pull_color}>正在刷新...</Text>
          </View>
        )
    }
  }

  _renderFooter = (viewState) => {
    let { pullState, pullDistancePercent } = viewState
    let { load_more_none, load_more_idle, will_load_more, loading_more, loaded_all, } = PullToRefreshListView.constants.viewState
    pullDistancePercent = Math.round(pullDistancePercent * 100)
    switch (pullState) {
      case load_more_none:
        return (
          <View style={style.pull_up_refresh}>
            <Text style={style.pull_color}>加载成功</Text>
          </View>
        )
      case load_more_idle:
        return (
          <View style={style.pull_up_refresh}>
            <Text style={style.pull_color}>上拉加载{pullDistancePercent}%</Text>
          </View>
        )
      case will_load_more:
        return (
          <View style={style.pull_up_refresh}>
            <Text style={style.pull_color}>释放立即加载{pullDistancePercent > 100 ? 100 : pullDistancePercent}%</Text>
          </View>
        )
      case loading_more:
        return (
          <View style={style.pull_up_refresh}>
            {this._renderActivityIndicator()}<Text style={style.pull_color}> 正在加载...</Text>
          </View>
        )
      case loaded_all:
        return (
          <View style={style.pull_up_refresh}>
            <Text style={style.pull_color}>我们已经到底啦！</Text>
          </View>
        )
    }
  }

  _onRefresh = () => {
    //console.log('outside _onRefresh start...') 

    //simulate request data 
    setTimeout(() => {

      //console.log('outside _onRefresh end...') 
      let addNum = 20
      let refreshedDataList = []
      for (let i = 0; i < addNum; i++) {
        refreshedDataList.push({
          text: `item-${i}`
        })
      }

      this.setState({
        dataList: refreshedDataList,
        dataSource: this._dataSource.cloneWithRows(refreshedDataList),
      })
      this._pullToRefreshListView.endRefresh()

    }, 500)
  }

  _onLoadMore = () => {
    //console.log('outside _onLoadMore start...') 

    setTimeout(() => {

      //console.log('outside _onLoadMore end...') 

      let length = this.state.dataList.length
      let addNum = 20
      let addedDataList = []
      if (length >= 100) {
        addNum = 3
      }
      for (let i = length; i < length + addNum; i++) {
        addedDataList.push({
          text: `item-${i}`
        })
      }
      let newDataList = this.state.dataList.concat(addedDataList)
      this.setState({
        dataList: newDataList,
        dataSource: this._dataSource.cloneWithRows(newDataList),
      })

      let loadedAll
      if (length >= 100) {
        loadedAll = true
        this._pullToRefreshListView.endLoadMore(loadedAll)
      }
      else {
        loadedAll = false
        this._pullToRefreshListView.endLoadMore(loadedAll)
      }

    }, 500)
  }

  _renderActivityIndicator() {
    return ActivityIndicator ? (
      <ActivityIndicator
        style={{ marginRight: 10, }}
        animating={true}
        color={'#666'}
        size={'small'} />
    ) : Platform.OS == 'android' ?
        (
          <ProgressBarAndroid
            style={{ marginRight: 10, }}
            color={'#666'}
            styleAttr={'Small'} />

        ) : (
          <ActivityIndicatorIOS
            style={{ marginRight: 10, }}
            animating={true}
            color={'#666'}
            size={'small'} />
        )
  }
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8'
  },
  thumbnail: {
    height: 56,
    borderBottomWidth: .5,
    borderBottomColor: 'rgba(0,0,0,.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  pull_down_refresh: {
    flexDirection: 'row',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  pull_up_refresh: {
    flexDirection: 'row',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  pull_color: {
    color: '#666'
  }

})

export default SmartPullToRefreshListView;
```

## 属性设置

Prop                    | Type   | Optional | Default   | Description
----------------------- | ------ | -------- | --------- | -----------
...ListView.propTypes   |        |          |           | see [react-native documents][3]
viewType                | enum   | Yes      | Symbol    | determines the viewType which will be used(ScrollView, ListView)
autoLoadMore            | bool   | Yes      | false     | when the value is true, pull up load more will be auto
onRefresh               | func   | Yes      |           | when refreshing, this function will be called
onLoadMore              | func   | Yes      |           | when loadingMore, this function will be called
onEndReachedThreshold   | number | Yes      | 0         | threshold in pixels (virtual, not physical) for calling onLoadMore
pullUpDistance          | number | Yes      | 35        | determines the pull up max distance
pullUpStayDistance      | number | Yes      | 50        | determines the pull up stay distance
pullDownDistance        | number | Yes      | 35        | determines the pull down max distance
pullDownStayDistance    | number | Yes      | 50        | determines the pull down stay distance
enabledPullUp           | bool   | Yes      | true      | when the value is false, pull up load more will be disabled
enabledPullDown         | bool   | Yes      | true      | when the value is false, pull down refresh will be disabled
listItemProps           | object | Yes      |           | see [react-native documents][4]
renderRowWithVisibility | bool   | Yes      |           | when the value is true, the children of the listRow can be controlled with 'hidden' state
pageTop                 | number | Yes      | 0         | determines the top relative to the page of the float section header(sticky header) view
floatSectionHeaderWidth | number | Yes      |deviceWidth| determines the width of the float section header(sticky header) view
renderFloatSectionHeader| number | Yes      | 0         | determines the width of the float section header(sticky header) view
listSectionProps        | object | Yes      |           | see [react-native documents][4]

## 感谢
* [react-native-smart-pull-to-refresh-listview](https://github.com/react-native-component/react-native-smart-pull-to-refresh-listview) 在此基础上改进，感谢您分享。
* [ShineFan](https://github.com/ShineFan) 感谢我的同事提供技术帮助，没有他的大力支持，我很难完成。



[0]: https://github.com/Yuzi-me/react-native-pull-to-refresh-list-demo
[1]: https://github.com/Yuzi-me/react-native-pull-to-refresh-list-demo/raw/master/src/img/android.gif
[2]: https://github.com/Yuzi-me/react-native-pull-to-refresh-list-demo/raw/master/src/img/ios.gif
[3]: http://facebook.github.io/react-native/docs/listview.html#props
[4]: http://facebook.github.io/react-native/docs/view.html#props
