package com.reactnativepulltorefresh.views.ptr;

import com.facebook.react.uimanager.events.Event;
import com.facebook.react.uimanager.events.RCTEventEmitter;

/**
 * Created by Yuzi on 2017/5/4.
 */

public class PtrEvent extends Event<PtrEvent> {

    public PtrEvent(int viewTag) {
        super(viewTag);
    }

    @Override
    public String getEventName() {
        return "ptrRefresh";
    }

    @Override
    public void dispatch(RCTEventEmitter rctEventEmitter) {
        rctEventEmitter.receiveEvent(getViewTag(), getEventName(), null);
    }

}
