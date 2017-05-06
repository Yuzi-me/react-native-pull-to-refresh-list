
/*import React, {
    PropTypes,
    Component,
} from 'react'
import {
    View,
    requireNativeComponent,
    Platform,
} from 'react-native'

export default class AndroidSwipeRefreshLayout extends Component {

    static propTypes = {
        ...View.propTypes,
        refreshing: PropTypes.bool,
        enabledPullUp: PropTypes.bool,
        enabledPullDown: PropTypes.bool,
        onSwipe: PropTypes.func,
        onRefresh: PropTypes.func,
    }

    setNativeProps(props) {
        this._nativeSwipeRefreshLayout.setNativeProps(props)
    }

    render() {

        return (
            <NativeSwipeRefreshLayout
                {...this.props}
                ref={ (component) => this._nativeSwipeRefreshLayout = component }
                onSwipe={this._onSwipe}
                onSwipeRefresh={this._onRefresh}
            />
        );
    }

    _onSwipe = (e) => {
        this.props.onSwipe(e.nativeEvent.movement)
    }

    _onRefresh = () => {
        this.props.onRefresh()
    }

}

const NativeSwipeRefreshLayout = Platform.OS == 'ios' ? View : requireNativeComponent('RCTSwipeRefreshLayout', AndroidSwipeRefreshLayout)*/


//---------------------------------------------


import React, { Component, PropTypes } from 'react';
import {
    requireNativeComponent,
    View,
} from 'react-native';
var {UIManager} = require('react-native');
var ReactNative = require('react-native');
const REF_PTR = "ptr_ref";

export default class RNPullToRefreshAndroid extends Component {
    static propTypes = {
        ...View.propTypes,
        refreshing: PropTypes.bool,
        enabledPullUp: PropTypes.bool,
        enabledPullDown: PropTypes.bool,
        onSwipe: PropTypes.func,
        onRefresh: PropTypes.func,
    }

    constructor(props) {
        super(props);
        this._onRefresh = this._onRefresh.bind(this);
    }

    _onRefresh() {
        // if (!this.props.handleRefresh) {
        //     return;
        // }
        // this.props.handleRefresh();
        this.props.onRefresh()
    };

    /**
     * 自动刷新
     */
    autoRefresh() {
        let self = this;
        UIManager.dispatchViewManagerCommand(
            ReactNative.findNodeHandle(self.refs[REF_PTR]),
            1,
            null
        );
    }

    /**
     * 刷新完成
     */
    refreshComplete() {
        //alert(REF_PTR)
        UIManager.dispatchViewManagerCommand(
            ReactNative.findNodeHandle(this.refs[REF_PTR]),
            0,
            null
        );
    }

    setNativeProps(props) {
        //this._nativeSwipeRefreshLayout.setNativeProps(props)
    }

    render() {
        // onPtrRefresh 事件对应原生的ptrRefresh事件
        return (
            <RCTPtrAndroid
                ref={REF_PTR}
                {...this.props}
                //ref={ (component) => this._nativeSwipeRefreshLayout = component }
                onPtrRefresh={() => this._onRefresh()}/>
        );
    }
}

RNPullToRefreshAndroid.name = "RCTPtrAndroid"; //便于调试时显示(可以设置为任意字符串)
RNPullToRefreshAndroid.propTypes = {
    handleRefresh: PropTypes.func,
    resistance: PropTypes.number,
    durationToCloseHeader: PropTypes.number,
    durationToClose: PropTypes.number,
    ratioOfHeaderHeightToRefresh: PropTypes.number,
    pullToRefresh: PropTypes.bool,
    keepHeaderWhenRefresh: PropTypes.bool,
    pinContent: PropTypes.bool,
    ...View.propTypes,
};

const RCTPtrAndroid = requireNativeComponent('RCTPtrAndroid', RNPullToRefreshAndroid, {nativeOnly: {onPtrRefresh: true}});
