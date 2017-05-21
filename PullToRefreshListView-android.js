/*
 * https://github.com/Yuzi-me/react-native-pull-to-refresh-list/
 * Released under the MIT license
 * Copyright (c) 2017.5.21 react-native-pull-to-refresh-list <75667980@qq.com>
 */

import React, { PropTypes, Component } from 'react'
import {
    View,
    ScrollView,
    ListView,
    StyleSheet,
    Text,
    Platform,
    Dimensions,
    ToastAndroid
} from 'react-native'

import { withinErrorMargin, } from './utils'
import constants, {
    viewType,
    viewState,
    refreshViewType,
    refreshAnimationDuration,
    scrollBounceAnimationDuration,
} from './constants'
import { easeOutCirc, } from './easing'
import RefreshView from './RefreshView'
import AndroidPullRefreshLayout from './AndroidSwipeRefreshLayout'
import ListItem from './ListItem'
import FloatSectionHeader from './AndroidFloatSectionHeader'

const styles = StyleSheet.create({
    header: {
        justifyContent: 'flex-end',
    },
    footer: {
        justifyContent: 'flex-start',
    },
    shrink: {
        height: 0,
    },
    marginVertical: {
        marginTop: 0,
        marginBottom: 0,
        marginVertical: 0,
    },
    paddingVertical: {
        paddingTop: 0,
        paddingBottom: 0,
        paddingVertical: 0,
    }
})

const { width: deviceWidth, } = Dimensions.get('window')
const keySeparator = ',';

// Yuzi
class PullToRefreshList extends Component {

    static constants = constants

    static defaultProps = {
        viewType: viewType.scrollView,
        pullUpDistance: 50,
        pullUpStayDistance: 35,
        pullDownDistance: 50,
        pullDownStayDistance: 35,
        enabledPullUp: true,
        enabledPullDown: true,
        autoLoadMore: false,
        scrollEventThrottle: 16,
        dataSource: new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2,
        }),
        renderRow: () => null,
        renderScrollComponent: props => <ScrollView {...props} />,
        onEndReachedThreshold: StyleSheet.hairlineWidth,    //0,
        initialListSize: 10,
        stickyHeaderIndices: [],
        pageSize: 1,
        scrollRenderAheadDistance: 1000,
        floatSectionHeaderWidth: deviceWidth,
        pageTop: 0,
    }

    static propTypes = {
        ...ListView.propTypes,
        pageTop: PropTypes.number,
        renderFloatSectionHeader: PropTypes.func,
        floatSectionHeaderWidth: PropTypes.number,
        listSectionProps: PropTypes.shape(View.propTypes),
        listItemProps: PropTypes.shape(View.propTypes),
        renderRowWithVisibility: PropTypes.bool,
        viewType: PropTypes.oneOf([
            viewType.scrollView,
            viewType.listView,
        ]),
        pullUpDistance: PropTypes.number,
        pullUpStayDistance: PropTypes.number,
        pullDownDistance: PropTypes.number,
        pullDownStayDistance: PropTypes.number,
        enabledPullUp: PropTypes.bool,
        enabledPullDown: PropTypes.bool,
        autoLoadMore: PropTypes.bool,
        onRefresh: PropTypes.func,
        onLoadMore: PropTypes.func,
    }

    constructor(props) {
        super(props)
        this.state = {
            resist: 20  // Yuzi Add
        }
        let { refresh_none, load_more_none, loading_more } = viewState

        if (props.autoLoadMore && props.viewType == viewType.listView) {

            this._onEndReached = () => {

                let { refreshing, load_more_none, loading_more, } = viewState
                //if (this._refreshState != refreshing && this._loadMoreState == load_more_none) {
                //alert(this._loadMoreState)
                if (this._loadMoreState == loading_more) {

                    this._loadMoreState = loading_more
                    this._footer.setState({
                        pullState: this._loadMoreState,
                    })

                    props.onLoadMore && props.onLoadMore()
                }
            }
        }

        this._refreshState = refresh_none
        this._loadMoreState = loading_more
        this._refreshBackAnimating = false
        this._loadMoreBackAnimating = false
        this._afterRefreshBacked = false
        this._afterLoadMoreBacked = false
        this._beginTimeStamp = null
        this._beginResetScrollTopTimeStamp = null
        this._refreshBackAnimationFrame = null
        this._touching = false
        this._scrollY = 0
        this._lastScrollY = 0
        this._fixedScrollY = 0
        this._refreshFixScrollY = 0
        this._paddingBlankDistance = 0

        this._listSectionRefs = {}
        this._listItemRefs = {}

        this._headerHeight = 0
        this._canLoadMore = false
        this._autoLoadFooterHeight = 0
    }

    render() {
        return (
            <AndroidPullRefreshLayout
                ref='ptr'
                onRefresh={this._onRefresh}
                durationToCloseHeader={300}
                durationToClose={200}
                resistance={this.state.resist}
                pinContent={false}
                ratioOfHeaderHeightToRefresh={1.2}
                pullToRefresh={false}
                keepHeaderWhenRefresh={true}
                style={{ flex: 1 }}
            >
                {this.props.viewType == viewType.scrollView ?
                    <ScrollView
                        ref={component => this._srcollView = component}
                        {...this.props}
                    >
                        {this._renderHeader()}
                        {this.props.children}
                        {this._renderFooter()}
                    </ScrollView> :
                    <ListView
                        ref={component => this._srcollView = component}
                        {...this.props}
                        onEndReached={this._onEndReached}
                        renderRow={this._renderRow}
                        renderHeader={this._renderHeader}
                        renderFooter={this._renderFooter}
                    />
                }

            </AndroidPullRefreshLayout>
        )
    }

    componentWillUnmount() {
        this.timer && clearTimeout(this.timer);
    }

    setNativeProps = (props) => {
        this._scrollView.setNativeProps(props)
    }

    //下拉刷新
    _onRefresh = () => {
        this.props.onRefresh && this.props.onRefresh()
        ToastAndroid.show("刷新成功", ToastAndroid.SHORT);
        this.timer = setTimeout(() => {
            this.refs.ptr.refreshComplete();
        }, 1500);
    }

    //数据
    _renderRow = (rowData, sectionID, rowID) => {
        let { listItemProps, renderRow, renderRowWithVisibility } = this.props

        if (listItemProps) {
            if (renderRowWithVisibility) {
                return (
                    <ListItem ref={component => this._listItemRefs[sectionID + keySeparator + rowID] = { sectionID, component, }}
                        {...listItemProps}
                        renderChildren={renderRow.bind(this, rowData, sectionID, rowID)} />
                )
            }
            else {
                return (
                    <ListItem ref={component => this._listItemRefs[sectionID + keySeparator + rowID] = { sectionID, component, }}
                        {...listItemProps}>
                        {renderRow(rowData, sectionID, rowID)}
                    </ListItem>
                )
            }
        }
        else {
            return renderRow(rowData, sectionID, rowID)
        }
    }

    //头部loading
    _renderHeader = () => {
        return (

            <RefreshView
                ref={component => this._header = component}
                style={[styles.header, styles.shrink,]}
                viewType={refreshViewType.header}
                renderRefreshContent={this.props.renderHeader} />
        )
    }

    _renderFooter = () => {
        return (
            <RefreshView ref={component => this._footer = component}
                onLayout={this._onFooterLayout}
                //style={[styles.footer, this.props.autoLoadMore ? null : styles.shrink, { opacity: 0, },]}
                //style={{height: 50, backgroundColor: '#f00'}}
                viewType={refreshViewType.footer}
                renderRefreshContent={this.props.renderFooter} />
        )
    }

    _onFooterLayout = (e) => {
        this._autoLoadFooterHeight = e.nativeEvent.layout.height
        //console.log(`_onFooterLayout this._autoLoadFooterHeight = ${this._autoLoadFooterHeight}`)
    }

    // 初始刷新
    beginRefresh = (bounceDisabled) => {
        // this._swipeRefreshLayout.setNativeProps({
        //     refreshing: true,
        // })
        // On Yuzi Modify
        // this.refs.ptrs.setNativeProps({
        //     refreshing: true,
        // })
        // this._scrollView.setNativeProps({
        //     scrollEnabled: false,
        // })
        //this.requestAnimationFrame(this._resetReverseHeaderLayout)
        // if (!bounceDisabled) {
        //     this.requestAnimationFrame(this._resetReverseHeaderLayout)
        // }
        //else {
        //console.log(`beginRefresh onRefresh()`)
        this.props.onRefresh && this.props.onRefresh()
        //}
        let { refreshing, } = viewState
        this._refreshState = refreshing
        this._header.setState({
            pullState: this._refreshState,
            pullDistancePercent: 1,
        })

        ////force hide footer
        //this._footer.setNativeProps({
        //    style: {
        //        opacity: 0,
        //    }
        //})

        //this.props.onRefresh && this.props.onRefresh()    //move to _resetReverseHeaderLayout and _resetRefreshScrollTop
        //this._listSectionRefs = {}
        //this._listItemRefs = {}
    }

    endRefresh = (bounceDisabled) => {
        // this._scrollView.setNativeProps({
        //     scrollEnabled: false
        // })

        

        let { refresh_none, loaded_all, load_more_none, loading_more } = viewState
        let { pullDownStayDistance, dataSource, renderSectionHeader, listSectionProps, } = this.props
        this._refreshState = refresh_none
        this._header.setState({
            pullState: this._refreshState,
        })

        this._refreshBackAnimating = true

        //if (this._scrollY < pullDownStayDistance) {
        // if (!bounceDisabled && this._scrollY < pullDownStayDistance) {
        //     this.requestAnimationFrame(this._resetHeaderLayout)
        // }
        // else {
        //this._swipeRefreshLayout.setNativeProps({
        //    refreshing: false,
        //})
        //this._scrollView.setNativeProps({
        //    scrollEnabled: true,
        //})
        this._header.setNativeProps({
            style: {
                height: 0,
            }
        })
        this._headerHeight = 0

        //this._scrollView.scrollTo({ y: this._scrollY - pullDownStayDistance, animated: false, })
        // if (!bounceDisabled) {
        //     this._scrollView.scrollTo({ y: this._scrollY - pullDownStayDistance, animated: false, })
        // }
        this._beginTimeStamp = null
        this._refreshBackAnimating = false
        this._afterRefreshBacked = true

        this._afterDirectRefresh = true

        //this._setPaddingBlank()
        //this._setPaddingBlank(bounceDisabled)

        ////force show footer
        //this._footer.setNativeProps({
        //    style: {
        //        opacity: 1,
        //    }
        //})

        //reset loadMoreState to load_more_none
        if (this._loadMoreState == loaded_all) {
            this._loadMoreState = loading_more
            this._footer.setState({
                pullState: this._loadMoreState,
                pullDistancePercent: 0,
            })
        }

        // this._swipeRefreshLayout.setNativeProps({
        //     refreshing: false,
        // })
        // this._scrollView.setNativeProps({
        //     scrollEnabled: true,
        // })

        if (renderSectionHeader && listSectionProps) {
            this._floatSectionHeader.setState({
                hidden: false,
            })
            let firstSectionID = dataSource.sectionIdentities[0]
            //reset float section header
            this._floatSectionHeader.setSectionID(firstSectionID)
        }

        // }
    }

    endLoadMore = (loadedAll) => {
        // this._scrollView.setNativeProps({
        //     scrollEnabled: false
        // })
        this.state = {
            resist: 2  // Yuzi Add
        }
        let { load_more_none, loaded_all, loading_more } = viewState
        let { autoLoadMore } = this.props
        if (!loadedAll) {
            this._loadMoreState = loading_more
        }
        else {
            this._loadMoreState = loaded_all
        }
        this._footer.setState({
            pullState: this._loadMoreState,
        })

        if (!autoLoadMore) {
            this._loadMoreBackAnimating = true

            if (this._scrollY >= this._scrollViewContentHeight - this._scrollViewContainerHeight) {
                this.requestAnimationFrame(this._resetFooterLayout)
            }
            else {
                //this._swipeRefreshLayout.setNativeProps({
                //    refreshing: false,
                //})
                //this._scrollView.setNativeProps({
                //    scrollEnabled: true,
                //})
                this._footer.setNativeProps({
                    style: {
                        height: 0,
                    }
                })
                this._scrollView.scrollTo({ y: this._scrollY, animated: false, })

                this._beginTimeStamp = null
                this._loadMoreBackAnimating = false
                this._afterLoadMoreBacked = true

                this._setPaddingBlank()

                this._swipeRefreshLayout.setNativeProps({
                    refreshing: false,
                })
                this._scrollView.setNativeProps({
                    scrollEnabled: true,
                })
            }
        }
        else {
            //this._setPaddingBlank()

            // this._swipeRefreshLayout.setNativeProps({
            //     refreshing: false,
            // })
            // On Yuzi Modify
            this.refs.ptr.setNativeProps({
                refreshing: false,
            })
            // this._scrollView.setNativeProps({
            //     scrollEnabled: true,
            // })
        }
    }

}

export default PullToRefreshList