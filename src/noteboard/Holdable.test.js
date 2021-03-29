import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import Holdable from "./Holdable.js";

jest.useFakeTimers("modern");

let root = null;
beforeEach(() => {
    root = document.createElement("div");
    document.body.appendChild(root);
});
afterEach(() => {
    unmountComponentAtNode(root);
    document.body.removeChild(root);
    root = null;
});

function grabHoldable() {
    return document.querySelector("[data-testid='holdable']");
}

it("renders without crashing", () => {
    render(<Holdable />, root);
});

describe("holding tests", () => {
    it("calls onHold() when clicked and held", () => {
        const onHold = jest.fn();
        act(() => {
            render(<Holdable onHold={onHold} />, root);
        });
        const holdable = grabHoldable();

        // click on the holdable
        act(() => {
            holdable.dispatchEvent(
                new MouseEvent("mousedown", { bubbles: true })
            );
        });

        // onHold() should not have activated yet
        expect(onHold).not.toHaveBeenCalled();

        // wait some time...
        act(() => {
            jest.advanceTimersByTime(100);
        });

        // still should not have activated...
        expect(onHold).not.toHaveBeenCalled();

        // wait the rest of the time
        act(() => {
            jest.advanceTimersByTime(1000);
        });

        expect(onHold).toHaveBeenCalledTimes(1);
    });

    it("calls onHold() when touched and held", () => {
        const onHold = jest.fn();
        act(() => {
            render(<Holdable onHold={onHold} />, root);
        });
        const holdable = grabHoldable();

        // click on the holdable
        act(() => {
            holdable.dispatchEvent(
                new TouchEvent("touchstart", { bubbles: true })
            );
        });

        // onHold() should not have activated yet
        expect(onHold).not.toHaveBeenCalled();

        // wait some time...
        act(() => {
            jest.advanceTimersByTime(100);
        });

        // still should not have activated...
        expect(onHold).not.toHaveBeenCalled();

        // wait the rest of the time
        act(() => {
            jest.advanceTimersByTime(1000);
        });

        expect(onHold).toHaveBeenCalledTimes(1);
    });
});

describe("cancel tests", () => {
    it("cancels when clicked and released too quickly", () => {
        const onHold = jest.fn();
        act(() => {
            render(<Holdable onHold={onHold} />, root);
        });
        const holdable = grabHoldable();

        act(() => {
            holdable.dispatchEvent(
                new MouseEvent("mousedown", { bubbles: true })
            );
        });
        expect(onHold).not.toHaveBeenCalled();

        act(() => {
            jest.advanceTimersByTime(100);
            holdable.dispatchEvent(
                new MouseEvent("mouseup", { bubbles: true })
            );
        });

        expect(onHold).not.toHaveBeenCalled();

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        expect(onHold).not.toHaveBeenCalled();
    });

    it("cancels when clicked and the mouse moves", () => {
        const onHold = jest.fn();
        act(() => {
            render(<Holdable onHold={onHold} />, root);
        });
        const holdable = grabHoldable();

        act(() => {
            holdable.dispatchEvent(
                new MouseEvent("mousedown", { bubbles: true })
            );
        });
        expect(onHold).not.toHaveBeenCalled();

        act(() => {
            jest.advanceTimersByTime(100);
            holdable.dispatchEvent(
                new MouseEvent("mousemove", { bubbles: true })
            );
        });

        expect(onHold).not.toHaveBeenCalled();

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        expect(onHold).not.toHaveBeenCalled();
    });

    it("cancels when touched and released too quickly", () => {
        const onHold = jest.fn();
        act(() => {
            render(<Holdable onHold={onHold} />, root);
        });
        const holdable = grabHoldable();

        act(() => {
            holdable.dispatchEvent(
                new TouchEvent("touchstart", { bubbles: true })
            );
        });
        expect(onHold).not.toHaveBeenCalled();

        act(() => {
            jest.advanceTimersByTime(100);
            holdable.dispatchEvent(
                new TouchEvent("touchend", { bubbles: true })
            );
        });

        expect(onHold).not.toHaveBeenCalled();

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        expect(onHold).not.toHaveBeenCalled();
    });

    it("cancels when touched and dragged", () => {
        const onHold = jest.fn();
        act(() => {
            render(<Holdable onHold={onHold} />, root);
        });
        const holdable = grabHoldable();

        act(() => {
            holdable.dispatchEvent(
                new TouchEvent("touchstart", {
                    bubbles: true,
                    touches: [{ clientX: 50, clientY: 50 }],
                })
            );
            // NOTE: dispatched to allow fake-move-detection to work properly
            //       (see the "ignores 'still'..." test below; it ensures this logic works correctly)
            holdable.dispatchEvent(
                new TouchEvent("touchmove", {
                    bubbles: true,
                    touches: [{ clientX: 50, clientY: 50 }],
                })
            );
        });
        expect(onHold).not.toHaveBeenCalled();

        act(() => {
            jest.advanceTimersByTime(100);
            holdable.dispatchEvent(
                new TouchEvent("touchmove", {
                    bubbles: true,
                    touches: [{ clientX: 100, clientY: 100 }],
                })
            );
        });

        expect(onHold).not.toHaveBeenCalled();

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        expect(onHold).not.toHaveBeenCalled();
    });

    it("doesn't cancel and ignores 'still' touchmove events", () => {
        const onHold = jest.fn();
        act(() => {
            render(<Holdable onHold={onHold} />, root);
        });
        const holdable = grabHoldable();

        act(() => {
            holdable.dispatchEvent(
                new TouchEvent("touchstart", {
                    bubbles: true,
                    touches: [{ clientX: 50, clientY: 50 }],
                })
            );
            // NOTE: all touchmove events are on the same coordinate to simulate
            //       the odd behavior of these events being fired without actually moving
            holdable.dispatchEvent(
                new TouchEvent("touchmove", {
                    bubbles: true,
                    touches: [{ clientX: 50, clientY: 50 }],
                })
            );
        });
        expect(onHold).not.toHaveBeenCalled();

        act(() => {
            jest.advanceTimersByTime(100);
            holdable.dispatchEvent(
                new TouchEvent("touchmove", {
                    bubbles: true,
                    touches: [{ clientX: 50, clientY: 50 }],
                })
            );
        });

        expect(onHold).not.toHaveBeenCalled();

        act(() => {
            jest.advanceTimersByTime(1000);
            holdable.dispatchEvent(
                new TouchEvent("touchmove", {
                    bubbles: true,
                    touches: [{ clientX: 50, clientY: 50 }],
                })
            );
        });

        expect(onHold).toHaveBeenCalledTimes(1);
    });
});
