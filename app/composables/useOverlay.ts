import type { Component } from "vue";
import type { ComponentEmit, ComponentProps } from "vue-component-type-helpers";
import { createSharedComposable } from "@vueuse/core";
import { markRaw, reactive, shallowReactive } from "vue";

/**
 * This is a workaround for a design limitation in TypeScript.
 *
 * Conditional types only match the last function overload, not a union of all possible
 * parameter types. This workaround forces TypeScript to properly extract the 'close'
 * event argument type from component emits with multiple event signatures.
 *
 * @see https://github.com/microsoft/TypeScript/issues/32164
 */
type CloseEventArgType<T> = T extends {
  (event: "close", arg_0: infer Arg, ...args: any[]): void;
  (...args: any[]): void;
  (...args: any[]): void;
  (...args: any[]): void;
  (...args: any[]): void;
  (...args: any[]): void;
  (...args: any[]): void;
  (...args: any[]): void;
  (...args: any[]): void;
  (...args: any[]): void;
  (...args: any[]): void;
  (...args: any[]): void;
  (...args: any[]): void;
  (...args: any[]): void;
  (...args: any[]): void;
  (...args: any[]): void;
  (...args: any[]): void;
} ? Arg : never;
export interface OverlayOptions<OverlayAttrs = Record<string, any>> {
  defaultOpen?: boolean;
  props?: OverlayAttrs;
  destroyOnClose?: boolean;
}

interface ManagedOverlayOptionsPrivate<T extends Component> {
  component?: T;
  id: symbol;
  isMounted: boolean;
  isOpen: boolean;
  originalProps?: ComponentProps<T>;
  resolvePromise?: (value: any) => void;
}
export type Overlay = OverlayOptions<Component> & ManagedOverlayOptionsPrivate<Component>;

type OverlayInstance<T extends Component> = Omit<ManagedOverlayOptionsPrivate<T>, "component"> & {
  id: symbol;
  open: (props?: ComponentProps<T>) => OpenedOverlay<T>;
  close: (value?: any) => void;
  patch: (props: Partial<ComponentProps<T>>) => void;
};

type OpenedOverlay<T extends Component> = Omit<OverlayInstance<T>, "open" | "close" | "patch" | "modelValue" | "resolvePromise"> & {
  result: Promise<CloseEventArgType<ComponentEmit<T>>>;
} & Promise<CloseEventArgType<ComponentEmit<T>>>;

function _useOverlay() {
  const overlays = shallowReactive<Overlay[]>([]);

  const create = <T extends Component>(component: T, _options?: OverlayOptions<ComponentProps<T>>): OverlayInstance<T> => {
    const { props, defaultOpen, destroyOnClose } = _options || {};

    const options = reactive<Overlay>({
      id: Symbol(import.meta.dev ? "useOverlay" : ""),
      isOpen: !!defaultOpen,
      component: markRaw(component!),
      isMounted: !!defaultOpen,
      destroyOnClose: !!destroyOnClose,
      originalProps: props || {},
      props: { ...props },
    });

    overlays.push(options);

    return {
      ...options,
      open: <T extends Component>(props?: ComponentProps<T>) => open(options.id, props),
      close: value => close(options.id, value),
      patch: <T extends Component>(props: Partial<ComponentProps<T>>) => patch(options.id, props),
    };
  };

  const open = <T extends Component>(id: symbol, props?: ComponentProps<T>): OpenedOverlay<T> => {
    const overlay = getOverlay(id);

    // If props are provided, merge them with the original props, otherwise use the original props
    if (props) {
      overlay.props = { ...overlay.originalProps, ...props };
    }
    else {
      overlay.props = { ...overlay.originalProps };
    }

    overlay.isOpen = true;
    overlay.isMounted = true;
    const result = new Promise<any>(resolve => overlay.resolvePromise = resolve);

    return Object.assign(result, {
      id,
      isMounted: overlay.isMounted,
      isOpen: overlay.isOpen,
      result,
    });
  };

  const close = (id: symbol, value?: any): void => {
    const overlay = getOverlay(id);

    overlay.isOpen = false;

    // Resolve the promise if it exists
    if (overlay.resolvePromise) {
      overlay.resolvePromise(value);
      overlay.resolvePromise = undefined;
    }
  };

  const closeAll = (): void => {
    overlays.forEach(overlay => close(overlay.id));
  };

  const unmount = (id: symbol): void => {
    const overlay = getOverlay(id);

    overlay.isMounted = false;

    if (overlay.destroyOnClose) {
      const index = overlays.findIndex(overlay => overlay.id === id);
      overlays.splice(index, 1);
    }
  };

  const patch = <T extends Component>(id: symbol, props: Partial<ComponentProps<T>>): void => {
    const overlay = getOverlay(id);

    overlay.props = { ...overlay.props, ...props };
  };

  const getOverlay = (id: symbol): Overlay => {
    const overlay = overlays.find(overlay => overlay.id === id);

    if (!overlay) {
      throw new Error("Overlay not found");
    }

    return overlay;
  };

  const isOpen = (id: symbol): boolean => {
    const overlay = getOverlay(id);

    return overlay.isOpen;
  };

  return {
    overlays,
    open,
    close,
    closeAll,
    create,
    patch,
    unmount,
    isOpen,
  };
}

export const useOverlay = /* @__PURE__ */ createSharedComposable(_useOverlay);
