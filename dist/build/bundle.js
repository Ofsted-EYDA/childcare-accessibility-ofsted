
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function select_option(select, value, mounting) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        if (!mounting || value !== undefined) {
            select.selectedIndex = -1; // no option should be selected
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked');
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    /**
     * Schedules a callback to run immediately before the component is unmounted.
     *
     * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
     * only one that runs inside a server-side component.
     *
     * https://svelte.dev/docs#run-time-svelte-ondestroy
     */
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    /**
     * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
     * Event dispatchers are functions that can take two arguments: `name` and `detail`.
     *
     * Component events created with `createEventDispatcher` create a
     * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
     * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
     * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
     * property and can contain any type of data.
     *
     * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
     */
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    /**
     * Associates an arbitrary `context` object with the current component and the specified `key`
     * and returns that object. The context is then available to children of the component
     * (including slotted content) with `getContext`.
     *
     * Like lifecycle functions, this must be called during component initialisation.
     *
     * https://svelte.dev/docs#run-time-svelte-setcontext
     */
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
        return context;
    }
    /**
     * Retrieves the context that belongs to the closest parent component with the specified `key`.
     * Must be called during component initialisation.
     *
     * https://svelte.dev/docs#run-time-svelte-getcontext
     */
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    var EOL = {},
        EOF = {},
        QUOTE = 34,
        NEWLINE = 10,
        RETURN = 13;

    function objectConverter(columns) {
      return new Function("d", "return {" + columns.map(function(name, i) {
        return JSON.stringify(name) + ": d[" + i + "] || \"\"";
      }).join(",") + "}");
    }

    function customConverter(columns, f) {
      var object = objectConverter(columns);
      return function(row, i) {
        return f(object(row), i, columns);
      };
    }

    // Compute unique columns in order of discovery.
    function inferColumns(rows) {
      var columnSet = Object.create(null),
          columns = [];

      rows.forEach(function(row) {
        for (var column in row) {
          if (!(column in columnSet)) {
            columns.push(columnSet[column] = column);
          }
        }
      });

      return columns;
    }

    function pad(value, width) {
      var s = value + "", length = s.length;
      return length < width ? new Array(width - length + 1).join(0) + s : s;
    }

    function formatYear(year) {
      return year < 0 ? "-" + pad(-year, 6)
        : year > 9999 ? "+" + pad(year, 6)
        : pad(year, 4);
    }

    function formatDate(date) {
      var hours = date.getUTCHours(),
          minutes = date.getUTCMinutes(),
          seconds = date.getUTCSeconds(),
          milliseconds = date.getUTCMilliseconds();
      return isNaN(date) ? "Invalid Date"
          : formatYear(date.getUTCFullYear()) + "-" + pad(date.getUTCMonth() + 1, 2) + "-" + pad(date.getUTCDate(), 2)
          + (milliseconds ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2) + "." + pad(milliseconds, 3) + "Z"
          : seconds ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2) + "Z"
          : minutes || hours ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + "Z"
          : "");
    }

    function dsv(delimiter) {
      var reFormat = new RegExp("[\"" + delimiter + "\n\r]"),
          DELIMITER = delimiter.charCodeAt(0);

      function parse(text, f) {
        var convert, columns, rows = parseRows(text, function(row, i) {
          if (convert) return convert(row, i - 1);
          columns = row, convert = f ? customConverter(row, f) : objectConverter(row);
        });
        rows.columns = columns || [];
        return rows;
      }

      function parseRows(text, f) {
        var rows = [], // output rows
            N = text.length,
            I = 0, // current character index
            n = 0, // current line number
            t, // current token
            eof = N <= 0, // current token followed by EOF?
            eol = false; // current token followed by EOL?

        // Strip the trailing newline.
        if (text.charCodeAt(N - 1) === NEWLINE) --N;
        if (text.charCodeAt(N - 1) === RETURN) --N;

        function token() {
          if (eof) return EOF;
          if (eol) return eol = false, EOL;

          // Unescape quotes.
          var i, j = I, c;
          if (text.charCodeAt(j) === QUOTE) {
            while (I++ < N && text.charCodeAt(I) !== QUOTE || text.charCodeAt(++I) === QUOTE);
            if ((i = I) >= N) eof = true;
            else if ((c = text.charCodeAt(I++)) === NEWLINE) eol = true;
            else if (c === RETURN) { eol = true; if (text.charCodeAt(I) === NEWLINE) ++I; }
            return text.slice(j + 1, i - 1).replace(/""/g, "\"");
          }

          // Find next delimiter or newline.
          while (I < N) {
            if ((c = text.charCodeAt(i = I++)) === NEWLINE) eol = true;
            else if (c === RETURN) { eol = true; if (text.charCodeAt(I) === NEWLINE) ++I; }
            else if (c !== DELIMITER) continue;
            return text.slice(j, i);
          }

          // Return last token before EOF.
          return eof = true, text.slice(j, N);
        }

        while ((t = token()) !== EOF) {
          var row = [];
          while (t !== EOL && t !== EOF) row.push(t), t = token();
          if (f && (row = f(row, n++)) == null) continue;
          rows.push(row);
        }

        return rows;
      }

      function preformatBody(rows, columns) {
        return rows.map(function(row) {
          return columns.map(function(column) {
            return formatValue(row[column]);
          }).join(delimiter);
        });
      }

      function format(rows, columns) {
        if (columns == null) columns = inferColumns(rows);
        return [columns.map(formatValue).join(delimiter)].concat(preformatBody(rows, columns)).join("\n");
      }

      function formatBody(rows, columns) {
        if (columns == null) columns = inferColumns(rows);
        return preformatBody(rows, columns).join("\n");
      }

      function formatRows(rows) {
        return rows.map(formatRow).join("\n");
      }

      function formatRow(row) {
        return row.map(formatValue).join(delimiter);
      }

      function formatValue(value) {
        return value == null ? ""
            : value instanceof Date ? formatDate(value)
            : reFormat.test(value += "") ? "\"" + value.replace(/"/g, "\"\"") + "\""
            : value;
      }

      return {
        parse: parse,
        parseRows: parseRows,
        format: format,
        formatBody: formatBody,
        formatRows: formatRows,
        formatRow: formatRow,
        formatValue: formatValue
      };
    }

    var csv = dsv(",");

    var csvParse = csv.parse;

    function autoType(object) {
      for (var key in object) {
        var value = object[key].trim(), number, m;
        if (!value) value = null;
        else if (value === "true") value = true;
        else if (value === "false") value = false;
        else if (value === "NaN") value = NaN;
        else if (!isNaN(number = +value)) value = number;
        else if (m = value.match(/^([-+]\d{2})?\d{4}(-\d{2}(-\d{2})?)?(T\d{2}:\d{2}(:\d{2}(\.\d{3})?)?(Z|[-+]\d{2}:\d{2})?)?$/)) {
          if (fixtz && !!m[4] && !m[7]) value = value.replace(/-/g, "/").replace(/T/, " ");
          value = new Date(value);
        }
        else continue;
        object[key] = value;
      }
      return object;
    }

    // https://github.com/d3/d3-dsv/issues/45
    const fixtz = new Date("2019-01-01T00:00").getHours() || new Date("2019-07-01T00:00").getHours();

    function identity(x) {
      return x;
    }

    function transform(transform) {
      if (transform == null) return identity;
      var x0,
          y0,
          kx = transform.scale[0],
          ky = transform.scale[1],
          dx = transform.translate[0],
          dy = transform.translate[1];
      return function(input, i) {
        if (!i) x0 = y0 = 0;
        var j = 2, n = input.length, output = new Array(n);
        output[0] = (x0 += input[0]) * kx + dx;
        output[1] = (y0 += input[1]) * ky + dy;
        while (j < n) output[j] = input[j], ++j;
        return output;
      };
    }

    function reverse(array, n) {
      var t, j = array.length, i = j - n;
      while (i < --j) t = array[i], array[i++] = array[j], array[j] = t;
    }

    function feature(topology, o) {
      if (typeof o === "string") o = topology.objects[o];
      return o.type === "GeometryCollection"
          ? {type: "FeatureCollection", features: o.geometries.map(function(o) { return feature$1(topology, o); })}
          : feature$1(topology, o);
    }

    function feature$1(topology, o) {
      var id = o.id,
          bbox = o.bbox,
          properties = o.properties == null ? {} : o.properties,
          geometry = object(topology, o);
      return id == null && bbox == null ? {type: "Feature", properties: properties, geometry: geometry}
          : bbox == null ? {type: "Feature", id: id, properties: properties, geometry: geometry}
          : {type: "Feature", id: id, bbox: bbox, properties: properties, geometry: geometry};
    }

    function object(topology, o) {
      var transformPoint = transform(topology.transform),
          arcs = topology.arcs;

      function arc(i, points) {
        if (points.length) points.pop();
        for (var a = arcs[i < 0 ? ~i : i], k = 0, n = a.length; k < n; ++k) {
          points.push(transformPoint(a[k], k));
        }
        if (i < 0) reverse(points, n);
      }

      function point(p) {
        return transformPoint(p);
      }

      function line(arcs) {
        var points = [];
        for (var i = 0, n = arcs.length; i < n; ++i) arc(arcs[i], points);
        if (points.length < 2) points.push(points[0]); // This should never happen per the specification.
        return points;
      }

      function ring(arcs) {
        var points = line(arcs);
        while (points.length < 4) points.push(points[0]); // This may happen if an arc has only two points.
        return points;
      }

      function polygon(arcs) {
        return arcs.map(ring);
      }

      function geometry(o) {
        var type = o.type, coordinates;
        switch (type) {
          case "GeometryCollection": return {type: type, geometries: o.geometries.map(geometry)};
          case "Point": coordinates = point(o.coordinates); break;
          case "MultiPoint": coordinates = o.coordinates.map(point); break;
          case "LineString": coordinates = line(o.arcs); break;
          case "MultiLineString": coordinates = o.arcs.map(line); break;
          case "Polygon": coordinates = polygon(o.arcs); break;
          case "MultiPolygon": coordinates = o.arcs.map(polygon); break;
          default: return null;
        }
        return {type: type, coordinates: coordinates};
      }

      return geometry(o);
    }

    async function getData(url) {
      let response = await fetch(url);
      let string = await response.text();
    	let data = await csvParse(string, autoType);
      return data;
    }

    async function getTopo(url, layer) {
      let response = await fetch(url);
      let json = await response.json();
      let geojson = await feature(json, layer);
      return geojson;
    }

    function getColor(value, breaks, colors) {
      let color;
      let found = false;
      let i = 1;
      while (found == false) {
        if (value <= breaks[i]) {
          color = colors[i - 1];
          found = true;
        } else {
          i ++;
        }
      }
      return color ? color : 'lightgrey';
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function unwrapExports (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var maplibreGl = createCommonjsModule(function (module, exports) {
    /* MapLibre GL JS is licensed under the 3-Clause BSD License. Full text of license: https://github.com/maplibre/maplibre-gl-js/blob/v3.3.1/LICENSE.txt */
    (function (global, factory) {
    module.exports = factory() ;
    })(commonjsGlobal, (function () {
    /* eslint-disable */

    var shared, worker, maplibregl;
    // define gets called three times: one for each chunk. we rely on the order
    // they're imported to know which is which
    function define(_, chunk) {
        if (!shared) {
            shared = chunk;
        } else if (!worker) {
            worker = chunk;
        } else {
            var workerBundleString = 'var sharedChunk = {}; (' + shared + ')(sharedChunk); (' + worker + ')(sharedChunk);';

            var sharedChunk = {};
            shared(sharedChunk);
            maplibregl = chunk(sharedChunk);
            if (typeof window !== 'undefined') {
                maplibregl.workerUrl = window.URL.createObjectURL(new Blob([workerBundleString], { type: 'text/javascript' }));
            }
        }
    }


    define(["exports"],(function(t){function e(t){return t&&t.__esModule&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}var r=n;function n(t,e){this.x=t,this.y=e;}n.prototype={clone:function(){return new n(this.x,this.y)},add:function(t){return this.clone()._add(t)},sub:function(t){return this.clone()._sub(t)},multByPoint:function(t){return this.clone()._multByPoint(t)},divByPoint:function(t){return this.clone()._divByPoint(t)},mult:function(t){return this.clone()._mult(t)},div:function(t){return this.clone()._div(t)},rotate:function(t){return this.clone()._rotate(t)},rotateAround:function(t,e){return this.clone()._rotateAround(t,e)},matMult:function(t){return this.clone()._matMult(t)},unit:function(){return this.clone()._unit()},perp:function(){return this.clone()._perp()},round:function(){return this.clone()._round()},mag:function(){return Math.sqrt(this.x*this.x+this.y*this.y)},equals:function(t){return this.x===t.x&&this.y===t.y},dist:function(t){return Math.sqrt(this.distSqr(t))},distSqr:function(t){var e=t.x-this.x,r=t.y-this.y;return e*e+r*r},angle:function(){return Math.atan2(this.y,this.x)},angleTo:function(t){return Math.atan2(this.y-t.y,this.x-t.x)},angleWith:function(t){return this.angleWithSep(t.x,t.y)},angleWithSep:function(t,e){return Math.atan2(this.x*e-this.y*t,this.x*t+this.y*e)},_matMult:function(t){var e=t[2]*this.x+t[3]*this.y;return this.x=t[0]*this.x+t[1]*this.y,this.y=e,this},_add:function(t){return this.x+=t.x,this.y+=t.y,this},_sub:function(t){return this.x-=t.x,this.y-=t.y,this},_mult:function(t){return this.x*=t,this.y*=t,this},_div:function(t){return this.x/=t,this.y/=t,this},_multByPoint:function(t){return this.x*=t.x,this.y*=t.y,this},_divByPoint:function(t){return this.x/=t.x,this.y/=t.y,this},_unit:function(){return this._div(this.mag()),this},_perp:function(){var t=this.y;return this.y=this.x,this.x=-t,this},_rotate:function(t){var e=Math.cos(t),r=Math.sin(t),n=r*this.x+e*this.y;return this.x=e*this.x-r*this.y,this.y=n,this},_rotateAround:function(t,e){var r=Math.cos(t),n=Math.sin(t),i=e.y+n*(this.x-e.x)+r*(this.y-e.y);return this.x=e.x+r*(this.x-e.x)-n*(this.y-e.y),this.y=i,this},_round:function(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}},n.convert=function(t){return t instanceof n?t:Array.isArray(t)?new n(t[0],t[1]):t};var i=e(r),a=s;function s(t,e,r,n){this.cx=3*t,this.bx=3*(r-t)-this.cx,this.ax=1-this.cx-this.bx,this.cy=3*e,this.by=3*(n-e)-this.cy,this.ay=1-this.cy-this.by,this.p1x=t,this.p1y=e,this.p2x=r,this.p2y=n;}s.prototype={sampleCurveX:function(t){return ((this.ax*t+this.bx)*t+this.cx)*t},sampleCurveY:function(t){return ((this.ay*t+this.by)*t+this.cy)*t},sampleCurveDerivativeX:function(t){return (3*this.ax*t+2*this.bx)*t+this.cx},solveCurveX:function(t,e){if(void 0===e&&(e=1e-6),t<0)return 0;if(t>1)return 1;for(var r=t,n=0;n<8;n++){var i=this.sampleCurveX(r)-t;if(Math.abs(i)<e)return r;var a=this.sampleCurveDerivativeX(r);if(Math.abs(a)<1e-6)break;r-=i/a;}var s=0,o=1;for(r=t,n=0;n<20&&(i=this.sampleCurveX(r),!(Math.abs(i-t)<e));n++)t>i?s=r:o=r,r=.5*(o-s)+s;return r},solve:function(t,e){return this.sampleCurveY(this.solveCurveX(t,e))}};var o=e(a);function l(t,e,r,n){const i=new o(t,e,r,n);return function(t){return i.solve(t)}}const u=l(.25,.1,.25,1);function c(t,e,r){return Math.min(r,Math.max(e,t))}function h(t,e,r){const n=r-e,i=((t-e)%n+n)%n+e;return i===e?r:i}function p(t,...e){for(const r of e)for(const e in r)t[e]=r[e];return t}let f=1;function d(t,e,r){const n={};for(const i in t)n[i]=e.call(r||this,t[i],i,t);return n}function y(t,e,r){const n={};for(const i in t)e.call(r||this,t[i],i,t)&&(n[i]=t[i]);return n}function m(t){return Array.isArray(t)?t.map(m):"object"==typeof t&&t?d(t,m):t}const g={};function x(t){g[t]||("undefined"!=typeof console&&console.warn(t),g[t]=!0);}function v(t,e,r){return (r.y-t.y)*(e.x-t.x)>(e.y-t.y)*(r.x-t.x)}function b(t){let e=0;for(let r,n,i=0,a=t.length,s=a-1;i<a;s=i++)r=t[i],n=t[s],e+=(n.x-r.x)*(r.y+n.y);return e}function w(){return "undefined"!=typeof WorkerGlobalScope&&"undefined"!=typeof self&&self instanceof WorkerGlobalScope}let _=null;function A(t){if(null==_){const e=t.navigator?t.navigator.userAgent:null;_=!!t.safari||!(!e||!(/\b(iPad|iPhone|iPod)\b/.test(e)||e.match("Safari")&&!e.match("Chrome")));}return _}function S(t){return "undefined"!=typeof ImageBitmap&&t instanceof ImageBitmap}const k="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII=";let I,z;const M={now:"undefined"!=typeof performance&&performance&&performance.now?performance.now.bind(performance):Date.now.bind(Date),frame(t){const e=requestAnimationFrame(t);return {cancel:()=>cancelAnimationFrame(e)}},getImageData(t,e=0){return this.getImageCanvasContext(t).getImageData(-e,-e,t.width+2*e,t.height+2*e)},getImageCanvasContext(t){const e=window.document.createElement("canvas"),r=e.getContext("2d",{willReadFrequently:!0});if(!r)throw new Error("failed to create canvas 2d context");return e.width=t.width,e.height=t.height,r.drawImage(t,0,0,t.width,t.height),r},resolveURL:t=>(I||(I=document.createElement("a")),I.href=t,I.href),hardwareConcurrency:"undefined"!=typeof navigator&&navigator.hardwareConcurrency||4,get prefersReducedMotion(){return !!matchMedia&&(null==z&&(z=matchMedia("(prefers-reduced-motion: reduce)")),z.matches)}},P={MAX_PARALLEL_IMAGE_REQUESTS:16,MAX_PARALLEL_IMAGE_REQUESTS_PER_FRAME:8,MAX_TILE_CACHE_ZOOM_LEVELS:5,REGISTERED_PROTOCOLS:{},WORKER_URL:""};class B extends Error{constructor(t,e,r,n){super(`AJAXError: ${e} (${t}): ${r}`),this.status=t,this.statusText=e,this.url=r,this.body=n;}}const C=w()?()=>self.worker&&self.worker.referrer:()=>("blob:"===window.location.protocol?window.parent:window).location.href,V=t=>P.REGISTERED_PROTOCOLS[t.substring(0,t.indexOf("://"))];function E(t,e){const r=new AbortController,n=new Request(t.url,{method:t.method||"GET",body:t.body,credentials:t.credentials,headers:t.headers,cache:t.cache,referrer:C(),signal:r.signal});let i=!1,a=!1;"json"===t.type&&n.headers.set("Accept","application/json");return a||fetch(n).then((r=>r.ok?(r=>{("arrayBuffer"===t.type||"image"===t.type?r.arrayBuffer():"json"===t.type?r.json():r.text()).then((t=>{a||(i=!0,e(null,t,r.headers.get("Cache-Control"),r.headers.get("Expires")));})).catch((t=>{a||e(new Error(t.message));}));})(r):r.blob().then((n=>e(new B(r.status,r.statusText,t.url,n)))))).catch((t=>{20!==t.code&&e(new Error(t.message));})),{cancel:()=>{a=!0,i||r.abort();}}}const T=function(t,e){if(/:\/\//.test(t.url)&&!/^https?:|^file:/.test(t.url)){if(w()&&self.worker&&self.worker.actor)return self.worker.actor.send("getResource",t,e);if(!w())return (V(t.url)||E)(t,e)}if(!(/^file:/.test(r=t.url)||/^file:/.test(C())&&!/^\w+:/.test(r))){if(fetch&&Request&&AbortController&&Object.prototype.hasOwnProperty.call(Request.prototype,"signal"))return E(t,e);if(w()&&self.worker&&self.worker.actor)return self.worker.actor.send("getResource",t,e,void 0,!0)}var r;return function(t,e){const r=new XMLHttpRequest;r.open(t.method||"GET",t.url,!0),"arrayBuffer"!==t.type&&"image"!==t.type||(r.responseType="arraybuffer");for(const e in t.headers)r.setRequestHeader(e,t.headers[e]);return "json"===t.type&&(r.responseType="text",r.setRequestHeader("Accept","application/json")),r.withCredentials="include"===t.credentials,r.onerror=()=>{e(new Error(r.statusText));},r.onload=()=>{if((r.status>=200&&r.status<300||0===r.status)&&null!==r.response){let n=r.response;if("json"===t.type)try{n=JSON.parse(r.response);}catch(t){return e(t)}e(null,n,r.getResponseHeader("Cache-Control"),r.getResponseHeader("Expires"));}else {const n=new Blob([r.response],{type:r.getResponseHeader("Content-Type")});e(new B(r.status,r.statusText,t.url,n));}},r.send(t.body),{cancel:()=>r.abort()}}(t,e)},F=function(t,e){return T(p(t,{type:"arrayBuffer"}),e)};function L(t){if(!t||t.indexOf("://")<=0||0===t.indexOf("data:image/")||0===t.indexOf("blob:"))return !0;const e=new URL(t),r=window.location;return e.protocol===r.protocol&&e.host===r.host}function $(t,e,r){r[t]&&-1!==r[t].indexOf(e)||(r[t]=r[t]||[],r[t].push(e));}function D(t,e,r){if(r&&r[t]){const n=r[t].indexOf(e);-1!==n&&r[t].splice(n,1);}}class O{constructor(t,e={}){p(this,e),this.type=t;}}class U extends O{constructor(t,e={}){super("error",p({error:t},e));}}class R{on(t,e){return this._listeners=this._listeners||{},$(t,e,this._listeners),this}off(t,e){return D(t,e,this._listeners),D(t,e,this._oneTimeListeners),this}once(t,e){return e?(this._oneTimeListeners=this._oneTimeListeners||{},$(t,e,this._oneTimeListeners),this):new Promise((e=>this.once(t,e)))}fire(t,e){"string"==typeof t&&(t=new O(t,e||{}));const r=t.type;if(this.listens(r)){t.target=this;const e=this._listeners&&this._listeners[r]?this._listeners[r].slice():[];for(const r of e)r.call(this,t);const n=this._oneTimeListeners&&this._oneTimeListeners[r]?this._oneTimeListeners[r].slice():[];for(const e of n)D(r,e,this._oneTimeListeners),e.call(this,t);const i=this._eventedParent;i&&(p(t,"function"==typeof this._eventedParentData?this._eventedParentData():this._eventedParentData),i.fire(t));}else t instanceof U&&console.error(t.error);return this}listens(t){return this._listeners&&this._listeners[t]&&this._listeners[t].length>0||this._oneTimeListeners&&this._oneTimeListeners[t]&&this._oneTimeListeners[t].length>0||this._eventedParent&&this._eventedParent.listens(t)}setEventedParent(t,e){return this._eventedParent=t,this._eventedParentData=e,this}}var q={$version:8,$root:{version:{required:!0,type:"enum",values:[8]},name:{type:"string"},metadata:{type:"*"},center:{type:"array",value:"number"},zoom:{type:"number"},bearing:{type:"number",default:0,period:360,units:"degrees"},pitch:{type:"number",default:0,units:"degrees"},light:{type:"light"},terrain:{type:"terrain"},sources:{required:!0,type:"sources"},sprite:{type:"sprite"},glyphs:{type:"string"},transition:{type:"transition"},layers:{required:!0,type:"array",value:"layer"}},sources:{"*":{type:"source"}},source:["source_vector","source_raster","source_raster_dem","source_geojson","source_video","source_image"],source_vector:{type:{required:!0,type:"enum",values:{vector:{}}},url:{type:"string"},tiles:{type:"array",value:"string"},bounds:{type:"array",value:"number",length:4,default:[-180,-85.051129,180,85.051129]},scheme:{type:"enum",values:{xyz:{},tms:{}},default:"xyz"},minzoom:{type:"number",default:0},maxzoom:{type:"number",default:22},attribution:{type:"string"},promoteId:{type:"promoteId"},volatile:{type:"boolean",default:!1},"*":{type:"*"}},source_raster:{type:{required:!0,type:"enum",values:{raster:{}}},url:{type:"string"},tiles:{type:"array",value:"string"},bounds:{type:"array",value:"number",length:4,default:[-180,-85.051129,180,85.051129]},minzoom:{type:"number",default:0},maxzoom:{type:"number",default:22},tileSize:{type:"number",default:512,units:"pixels"},scheme:{type:"enum",values:{xyz:{},tms:{}},default:"xyz"},attribution:{type:"string"},volatile:{type:"boolean",default:!1},"*":{type:"*"}},source_raster_dem:{type:{required:!0,type:"enum",values:{"raster-dem":{}}},url:{type:"string"},tiles:{type:"array",value:"string"},bounds:{type:"array",value:"number",length:4,default:[-180,-85.051129,180,85.051129]},minzoom:{type:"number",default:0},maxzoom:{type:"number",default:22},tileSize:{type:"number",default:512,units:"pixels"},attribution:{type:"string"},encoding:{type:"enum",values:{terrarium:{},mapbox:{}},default:"mapbox"},volatile:{type:"boolean",default:!1},"*":{type:"*"}},source_geojson:{type:{required:!0,type:"enum",values:{geojson:{}}},data:{required:!0,type:"*"},maxzoom:{type:"number",default:18},attribution:{type:"string"},buffer:{type:"number",default:128,maximum:512,minimum:0},filter:{type:"*"},tolerance:{type:"number",default:.375},cluster:{type:"boolean",default:!1},clusterRadius:{type:"number",default:50,minimum:0},clusterMaxZoom:{type:"number"},clusterMinPoints:{type:"number"},clusterProperties:{type:"*"},lineMetrics:{type:"boolean",default:!1},generateId:{type:"boolean",default:!1},promoteId:{type:"promoteId"}},source_video:{type:{required:!0,type:"enum",values:{video:{}}},urls:{required:!0,type:"array",value:"string"},coordinates:{required:!0,type:"array",length:4,value:{type:"array",length:2,value:"number"}}},source_image:{type:{required:!0,type:"enum",values:{image:{}}},url:{required:!0,type:"string"},coordinates:{required:!0,type:"array",length:4,value:{type:"array",length:2,value:"number"}}},layer:{id:{type:"string",required:!0},type:{type:"enum",values:{fill:{},line:{},symbol:{},circle:{},heatmap:{},"fill-extrusion":{},raster:{},hillshade:{},background:{}},required:!0},metadata:{type:"*"},source:{type:"string"},"source-layer":{type:"string"},minzoom:{type:"number",minimum:0,maximum:24},maxzoom:{type:"number",minimum:0,maximum:24},filter:{type:"filter"},layout:{type:"layout"},paint:{type:"paint"}},layout:["layout_fill","layout_line","layout_circle","layout_heatmap","layout_fill-extrusion","layout_symbol","layout_raster","layout_hillshade","layout_background"],layout_background:{visibility:{type:"enum",values:{visible:{},none:{}},default:"visible","property-type":"constant"}},layout_fill:{"fill-sort-key":{type:"number",expression:{interpolated:!1,parameters:["zoom","feature"]},"property-type":"data-driven"},visibility:{type:"enum",values:{visible:{},none:{}},default:"visible","property-type":"constant"}},layout_circle:{"circle-sort-key":{type:"number",expression:{interpolated:!1,parameters:["zoom","feature"]},"property-type":"data-driven"},visibility:{type:"enum",values:{visible:{},none:{}},default:"visible","property-type":"constant"}},layout_heatmap:{visibility:{type:"enum",values:{visible:{},none:{}},default:"visible","property-type":"constant"}},"layout_fill-extrusion":{visibility:{type:"enum",values:{visible:{},none:{}},default:"visible","property-type":"constant"}},layout_line:{"line-cap":{type:"enum",values:{butt:{},round:{},square:{}},default:"butt",expression:{interpolated:!1,parameters:["zoom"]},"property-type":"data-constant"},"line-join":{type:"enum",values:{bevel:{},round:{},miter:{}},default:"miter",expression:{interpolated:!1,parameters:["zoom","feature"]},"property-type":"data-driven"},"line-miter-limit":{type:"number",default:2,requires:[{"line-join":"miter"}],expression:{interpolated:!0,parameters:["zoom"]},"property-type":"data-constant"},"line-round-limit":{type:"number",default:1.05,requires:[{"line-join":"round"}],expression:{interpolated:!0,parameters:["zoom"]},"property-type":"data-constant"},"line-sort-key":{type:"number",expression:{interpolated:!1,parameters:["zoom","feature"]},"property-type":"data-driven"},visibility:{type:"enum",values:{visible:{},none:{}},default:"visible","property-type":"constant"}},layout_symbol:{"symbol-placement":{type:"enum",values:{point:{},line:{},"line-center":{}},default:"point",expression:{interpolated:!1,parameters:["zoom"]},"property-type":"data-constant"},"symbol-spacing":{type:"number",default:250,minimum:1,units:"pixels",requires:[{"symbol-placement":"line"}],expression:{interpolated:!0,parameters:["zoom"]},"property-type":"data-constant"},"symbol-avoid-edges":{type:"boolean",default:!1,expression:{interpolated:!1,parameters:["zoom"]},"property-type":"data-constant"},"symbol-sort-key":{type:"number",expression:{interpolated:!1,parameters:["zoom","feature"]},"property-type":"data-driven"},"symbol-z-order":{type:"enum",values:{auto:{},"viewport-y":{},source:{}},default:"auto",expression:{interpolated:!1,parameters:["zoom"]},"property-type":"data-constant"},"icon-allow-overlap":{type:"boolean",default:!1,requires:["icon-image",{"!":"icon-overlap"}],expression:{interpolated:!1,parameters:["zoom"]},"property-type":"data-constant"},"icon-overlap":{type:"enum",values:{never:{},always:{},cooperative:{}},requires:["icon-image"],expression:{interpolated:!1,parameters:["zoom"]},"property-type":"data-constant"},"icon-ignore-placement":{type:"boolean",default:!1,requires:["icon-image"],expression:{interpolated:!1,parameters:["zoom"]},"property-type":"data-constant"},"icon-optional":{type:"boolean",default:!1,requires:["icon-image","text-field"],expression:{interpolated:!1,parameters:["zoom"]},"property-type":"data-constant"},"icon-rotation-alignment":{type:"enum",values:{map:{},viewport:{},auto:{}},default:"auto",requires:["icon-image"],expression:{interpolated:!1,parameters:["zoom"]},"property-type":"data-constant"},"icon-size":{type:"number",default:1,minimum:0,units:"factor of the original icon size",requires:["icon-image"],expression:{interpolated:!0,parameters:["zoom","feature"]},"property-type":"data-driven"},"icon-text-fit":{type:"enum",values:{none:{},width:{},height:{},both:{}},default:"none",requires:["icon-image","text-field"],expression:{interpolated:!1,parameters:["zoom"]},"property-type":"data-constant"},"icon-text-fit-padding":{type:"array",value:"number",length:4,default:[0,0,0,0],units:"pixels",requires:["icon-image","text-field",{"icon-text-fit":["both","width","height"]}],expression:{interpolated:!0,parameters:["zoom"]},"property-type":"data-constant"},"icon-image":{type:"resolvedImage",tokens:!0,expression:{interpolated:!1,parameters:["zoom","feature"]},"property-type":"data-driven"},"icon-rotate":{type:"number",default:0,period:360,units:"degrees",requires:["icon-image"],expression:{interpolated:!0,parameters:["zoom","feature"]},"property-type":"data-driven"},"icon-padding":{type:"padding",default:[2],units:"pixels",requires:["icon-image"],expression:{interpolated:!0,parameters:["zoom","feature"]},"property-type":"data-driven"},"icon-keep-upright":{type:"boolean",default:!1,requires:["icon-image",{"icon-rotation-alignment":"map"},{"symbol-placement":["line","line-center"]}],expression:{interpolated:!1,parameters:["zoom"]},"property-type":"data-constant"},"icon-offset":{type:"array",value:"number",length:2,default:[0,0],requires:["icon-image"],expression:{interpolated:!0,parameters:["zoom","feature"]},"property-type":"data-driven"},"icon-anchor":{type:"enum",values:{center:{},left:{},right:{},top:{},bottom:{},"top-left":{},"top-right":{},"bottom-left":{},"bottom-right":{}},default:"center",requires:["icon-image"],expression:{interpolated:!1,parameters:["zoom","feature"]},"property-type":"data-driven"},"icon-pitch-alignment":{type:"enum",values:{map:{},viewport:{},auto:{}},default:"auto",requires:["icon-image"],expression:{interpolated:!1,parameters:["zoom"]},"property-type":"data-constant"},"text-pitch-alignment":{type:"enum",values:{map:{},viewport:{},auto:{}},default:"auto",requires:["text-field"],expression:{interpolated:!1,parameters:["zoom"]},"property-type":"data-constant"},"text-rotation-alignment":{type:"enum",values:{map:{},viewport:{},"viewport-glyph":{},auto:{}},default:"auto",requires:["text-field"],expression:{interpolated:!1,parameters:["zoom"]},"property-type":"data-constant"},"text-field":{type:"formatted",default:"",tokens:!0,expression:{interpolated:!1,parameters:["zoom","feature"]},"property-type":"data-driven"},"text-font":{type:"array",value:"string",default:["Open Sans Regular","Arial Unicode MS Regular"],requires:["text-field"],expression:{interpolated:!1,parameters:["zoom","feature"]},"property-type":"data-driven"},"text-size":{type:"number",default:16,minimum:0,units:"pixels",requires:["text-field"],expression:{interpolated:!0,parameters:["zoom","feature"]},"property-type":"data-driven"},"text-max-width":{type:"number",default:10,minimum:0,units:"ems",requires:["text-field"],expression:{interpolated:!0,parameters:["zoom","feature"]},"property-type":"data-driven"},"text-line-height":{type:"number",default:1.2,units:"ems",requires:["text-field"],expression:{interpolated:!0,parameters:["zoom"]},"property-type":"data-constant"},"text-letter-spacing":{type:"number",default:0,units:"ems",requires:["text-field"],expression:{interpolated:!0,parameters:["zoom","feature"]},"property-type":"data-driven"},"text-justify":{type:"enum",values:{auto:{},left:{},center:{},right:{}},default:"center",requires:["text-field"],expression:{interpolated:!1,parameters:["zoom","feature"]},"property-type":"data-driven"},"text-radial-offset":{type:"number",units:"ems",default:0,requires:["text-field"],"property-type":"data-driven",expression:{interpolated:!0,parameters:["zoom","feature"]}},"text-variable-anchor":{type:"array",value:"enum",values:{center:{},left:{},right:{},top:{},bottom:{},"top-left":{},"top-right":{},"bottom-left":{},"bottom-right":{}},requires:["text-field",{"symbol-placement":["point"]}],expression:{interpolated:!1,parameters:["zoom"]},"property-type":"data-constant"},"text-variable-anchor-offset":{type:"variableAnchorOffsetCollection",requires:["text-field",{"symbol-placement":["point"]}],expression:{interpolated:!0,parameters:["zoom","feature"]},"property-type":"data-driven"},"text-anchor":{type:"enum",values:{center:{},left:{},right:{},top:{},bottom:{},"top-left":{},"top-right":{},"bottom-left":{},"bottom-right":{}},default:"center",requires:["text-field",{"!":"text-variable-anchor"}],expression:{interpolated:!1,parameters:["zoom","feature"]},"property-type":"data-driven"},"text-max-angle":{type:"number",default:45,units:"degrees",requires:["text-field",{"symbol-placement":["line","line-center"]}],expression:{interpolated:!0,parameters:["zoom"]},"property-type":"data-constant"},"text-writing-mode":{type:"array",value:"enum",values:{horizontal:{},vertical:{}},requires:["text-field",{"symbol-placement":["point"]}],expression:{interpolated:!1,parameters:["zoom"]},"property-type":"data-constant"},"text-rotate":{type:"number",default:0,period:360,units:"degrees",requires:["text-field"],expression:{interpolated:!0,parameters:["zoom","feature"]},"property-type":"data-driven"},"text-padding":{type:"number",default:2,minimum:0,units:"pixels",requires:["text-field"],expression:{interpolated:!0,parameters:["zoom"]},"property-type":"data-constant"},"text-keep-upright":{type:"boolean",default:!0,requires:["text-field",{"text-rotation-alignment":"map"},{"symbol-placement":["line","line-center"]}],expression:{interpolated:!1,parameters:["zoom"]},"property-type":"data-constant"},"text-transform":{type:"enum",values:{none:{},uppercase:{},lowercase:{}},default:"none",requires:["text-field"],expression:{interpolated:!1,parameters:["zoom","feature"]},"property-type":"data-driven"},"text-offset":{type:"array",value:"number",units:"ems",length:2,default:[0,0],requires:["text-field",{"!":"text-radial-offset"}],expression:{interpolated:!0,parameters:["zoom","feature"]},"property-type":"data-driven"},"text-allow-overlap":{type:"boolean",default:!1,requires:["text-field",{"!":"text-overlap"}],expression:{interpolated:!1,parameters:["zoom"]},"property-type":"data-constant"},"text-overlap":{type:"enum",values:{never:{},always:{},cooperative:{}},requires:["text-field"],expression:{interpolated:!1,parameters:["zoom"]},"property-type":"data-constant"},"text-ignore-placement":{type:"boolean",default:!1,requires:["text-field"],expression:{interpolated:!1,parameters:["zoom"]},"property-type":"data-constant"},"text-optional":{type:"boolean",default:!1,requires:["text-field","icon-image"],expression:{interpolated:!1,parameters:["zoom"]},"property-type":"data-constant"},visibility:{type:"enum",values:{visible:{},none:{}},default:"visible","property-type":"constant"}},layout_raster:{visibility:{type:"enum",values:{visible:{},none:{}},default:"visible","property-type":"constant"}},layout_hillshade:{visibility:{type:"enum",values:{visible:{},none:{}},default:"visible","property-type":"constant"}},filter:{type:"array",value:"*"},filter_operator:{type:"enum",values:{"==":{},"!=":{},">":{},">=":{},"<":{},"<=":{},in:{},"!in":{},all:{},any:{},none:{},has:{},"!has":{},within:{}}},geometry_type:{type:"enum",values:{Point:{},LineString:{},Polygon:{}}},function:{expression:{type:"expression"},stops:{type:"array",value:"function_stop"},base:{type:"number",default:1,minimum:0},property:{type:"string",default:"$zoom"},type:{type:"enum",values:{identity:{},exponential:{},interval:{},categorical:{}},default:"exponential"},colorSpace:{type:"enum",values:{rgb:{},lab:{},hcl:{}},default:"rgb"},default:{type:"*",required:!1}},function_stop:{type:"array",minimum:0,maximum:24,value:["number","color"],length:2},expression:{type:"array",value:"*",minimum:1},light:{anchor:{type:"enum",default:"viewport",values:{map:{},viewport:{}},"property-type":"data-constant",transition:!1,expression:{interpolated:!1,parameters:["zoom"]}},position:{type:"array",default:[1.15,210,30],length:3,value:"number","property-type":"data-constant",transition:!0,expression:{interpolated:!0,parameters:["zoom"]}},color:{type:"color","property-type":"data-constant",default:"#ffffff",expression:{interpolated:!0,parameters:["zoom"]},transition:!0},intensity:{type:"number","property-type":"data-constant",default:.5,minimum:0,maximum:1,expression:{interpolated:!0,parameters:["zoom"]},transition:!0}},terrain:{source:{type:"string",required:!0},exaggeration:{type:"number",minimum:0,default:1}},paint:["paint_fill","paint_line","paint_circle","paint_heatmap","paint_fill-extrusion","paint_symbol","paint_raster","paint_hillshade","paint_background"],paint_fill:{"fill-antialias":{type:"boolean",default:!0,expression:{interpolated:!1,parameters:["zoom"]},"property-type":"data-constant"},"fill-opacity":{type:"number",default:1,minimum:0,maximum:1,transition:!0,expression:{interpolated:!0,parameters:["zoom","feature","feature-state"]},"property-type":"data-driven"},"fill-color":{type:"color",default:"#000000",transition:!0,requires:[{"!":"fill-pattern"}],expression:{interpolated:!0,parameters:["zoom","feature","feature-state"]},"property-type":"data-driven"},"fill-outline-color":{type:"color",transition:!0,requires:[{"!":"fill-pattern"},{"fill-antialias":!0}],expression:{interpolated:!0,parameters:["zoom","feature","feature-state"]},"property-type":"data-driven"},"fill-translate":{type:"array",value:"number",length:2,default:[0,0],transition:!0,units:"pixels",expression:{interpolated:!0,parameters:["zoom"]},"property-type":"data-constant"},"fill-translate-anchor":{type:"enum",values:{map:{},viewport:{}},default:"map",requires:["fill-translate"],expression:{interpolated:!1,parameters:["zoom"]},"property-type":"data-constant"},"fill-pattern":{type:"resolvedImage",transition:!0,expression:{interpolated:!1,parameters:["zoom","feature"]},"property-type":"cross-faded-data-driven"}},"paint_fill-extrusion":{"fill-extrusion-opacity":{type:"number",default:1,minimum:0,maximum:1,transition:!0,expression:{interpolated:!0,parameters:["zoom"]},"property-type":"data-constant"},"fill-extrusion-color":{type:"color",default:"#000000",transition:!0,requires:[{"!":"fill-extrusion-pattern"}],expression:{interpolated:!0,parameters:["zoom","feature","feature-state"]},"property-type":"data-driven"},"fill-extrusion-translate":{type:"array",value:"number",length:2,default:[0,0],transition:!0,units:"pixels",expression:{interpolated:!0,parameters:["zoom"]},"property-type":"data-constant"},"fill-extrusion-translate-anchor":{type:"enum",values:{map:{},viewport:{}},default:"map",requires:["fill-extrusion-translate"],expression:{interpolated:!1,parameters:["zoom"]},"property-type":"data-constant"},"fill-extrusion-pattern":{type:"resolvedImage",transition:!0,expression:{interpolated:!1,parameters:["zoom","feature"]},"property-type":"cross-faded-data-driven"},"fill-extrusion-height":{type:"number",default:0,minimum:0,units:"meters",transition:!0,expression:{interpolated:!0,parameters:["zoom","feature","feature-state"]},"property-type":"data-driven"},"fill-extrusion-base":{type:"number",default:0,minimum:0,units:"meters",transition:!0,requires:["fill-extrusion-height"],expression:{interpolated:!0,parameters:["zoom","feature","feature-state"]},"property-type":"data-driven"},"fill-extrusion-vertical-gradient":{type:"boolean",default:!0,transition:!1,expression:{interpolated:!1,parameters:["zoom"]},"property-type":"data-constant"}},paint_line:{"line-opacity":{type:"number",default:1,minimum:0,maximum:1,transition:!0,expression:{interpolated:!0,parameters:["zoom","feature","feature-state"]},"property-type":"data-driven"},"line-color":{type:"color",default:"#000000",transition:!0,requires:[{"!":"line-pattern"}],expression:{interpolated:!0,parameters:["zoom","feature","feature-state"]},"property-type":"data-driven"},"line-translate":{type:"array",value:"number",length:2,default:[0,0],transition:!0,units:"pixels",expression:{interpolated:!0,parameters:["zoom"]},"property-type":"data-constant"},"line-translate-anchor":{type:"enum",values:{map:{},viewport:{}},default:"map",requires:["line-translate"],expression:{interpolated:!1,parameters:["zoom"]},"property-type":"data-constant"},"line-width":{type:"number",default:1,minimum:0,transition:!0,units:"pixels",expression:{interpolated:!0,parameters:["zoom","feature","feature-state"]},"property-type":"data-driven"},"line-gap-width":{type:"number",default:0,minimum:0,transition:!0,units:"pixels",expression:{interpolated:!0,parameters:["zoom","feature","feature-state"]},"property-type":"data-driven"},"line-offset":{type:"number",default:0,transition:!0,units:"pixels",expression:{interpolated:!0,parameters:["zoom","feature","feature-state"]},"property-type":"data-driven"},"line-blur":{type:"number",default:0,minimum:0,transition:!0,units:"pixels",expression:{interpolated:!0,parameters:["zoom","feature","feature-state"]},"property-type":"data-driven"},"line-dasharray":{type:"array",value:"number",minimum:0,transition:!0,units:"line widths",requires:[{"!":"line-pattern"}],expression:{interpolated:!1,parameters:["zoom"]},"property-type":"cross-faded"},"line-pattern":{type:"resolvedImage",transition:!0,expression:{interpolated:!1,parameters:["zoom","feature"]},"property-type":"cross-faded-data-driven"},"line-gradient":{type:"color",transition:!1,requires:[{"!":"line-dasharray"},{"!":"line-pattern"},{source:"geojson",has:{lineMetrics:!0}}],expression:{interpolated:!0,parameters:["line-progress"]},"property-type":"color-ramp"}},paint_circle:{"circle-radius":{type:"number",default:5,minimum:0,transition:!0,units:"pixels",expression:{interpolated:!0,parameters:["zoom","feature","feature-state"]},"property-type":"data-driven"},"circle-color":{type:"color",default:"#000000",transition:!0,expression:{interpolated:!0,parameters:["zoom","feature","feature-state"]},"property-type":"data-driven"},"circle-blur":{type:"number",default:0,transition:!0,expression:{interpolated:!0,parameters:["zoom","feature","feature-state"]},"property-type":"data-driven"},"circle-opacity":{type:"number",default:1,minimum:0,maximum:1,transition:!0,expression:{interpolated:!0,parameters:["zoom","feature","feature-state"]},"property-type":"data-driven"},"circle-translate":{type:"array",value:"number",length:2,default:[0,0],transition:!0,units:"pixels",expression:{interpolated:!0,parameters:["zoom"]},"property-type":"data-constant"},"circle-translate-anchor":{type:"enum",values:{map:{},viewport:{}},default:"map",requires:["circle-translate"],expression:{interpolated:!1,parameters:["zoom"]},"property-type":"data-constant"},"circle-pitch-scale":{type:"enum",values:{map:{},viewport:{}},default:"map",expression:{interpolated:!1,parameters:["zoom"]},"property-type":"data-constant"},"circle-pitch-alignment":{type:"enum",values:{map:{},viewport:{}},default:"viewport",expression:{interpolated:!1,parameters:["zoom"]},"property-type":"data-constant"},"circle-stroke-width":{type:"number",default:0,minimum:0,transition:!0,units:"pixels",expression:{interpolated:!0,parameters:["zoom","feature","feature-state"]},"property-type":"data-driven"},"circle-stroke-color":{type:"color",default:"#000000",transition:!0,expression:{interpolated:!0,parameters:["zoom","feature","feature-state"]},"property-type":"data-driven"},"circle-stroke-opacity":{type:"number",default:1,minimum:0,maximum:1,transition:!0,expression:{interpolated:!0,parameters:["zoom","feature","feature-state"]},"property-type":"data-driven"}},paint_heatmap:{"heatmap-radius":{type:"number",default:30,minimum:1,transition:!0,units:"pixels",expression:{interpolated:!0,parameters:["zoom","feature","feature-state"]},"property-type":"data-driven"},"heatmap-weight":{type:"number",default:1,minimum:0,transition:!1,expression:{interpolated:!0,parameters:["zoom","feature","feature-state"]},"property-type":"data-driven"},"heatmap-intensity":{type:"number",default:1,minimum:0,transition:!0,expression:{interpolated:!0,parameters:["zoom"]},"property-type":"data-constant"},"heatmap-color":{type:"color",default:["interpolate",["linear"],["heatmap-density"],0,"rgba(0, 0, 255, 0)",.1,"royalblue",.3,"cyan",.5,"lime",.7,"yellow",1,"red"],transition:!1,expression:{interpolated:!0,parameters:["heatmap-density"]},"property-type":"color-ramp"},"heatmap-opacity":{type:"number",default:1,minimum:0,maximum:1,transition:!0,expression:{interpolated:!0,parameters:["zoom"]},"property-type":"data-constant"}},paint_symbol:{"icon-opacity":{type:"number",default:1,minimum:0,maximum:1,transition:!0,requires:["icon-image"],expression:{interpolated:!0,parameters:["zoom","feature","feature-state"]},"property-type":"data-driven"},"icon-color":{type:"color",default:"#000000",transition:!0,requires:["icon-image"],expression:{interpolated:!0,parameters:["zoom","feature","feature-state"]},"property-type":"data-driven"},"icon-halo-color":{type:"color",default:"rgba(0, 0, 0, 0)",transition:!0,requires:["icon-image"],expression:{interpolated:!0,parameters:["zoom","feature","feature-state"]},"property-type":"data-driven"},"icon-halo-width":{type:"number",default:0,minimum:0,transition:!0,units:"pixels",requires:["icon-image"],expression:{interpolated:!0,parameters:["zoom","feature","feature-state"]},"property-type":"data-driven"},"icon-halo-blur":{type:"number",default:0,minimum:0,transition:!0,units:"pixels",requires:["icon-image"],expression:{interpolated:!0,parameters:["zoom","feature","feature-state"]},"property-type":"data-driven"},"icon-translate":{type:"array",value:"number",length:2,default:[0,0],transition:!0,units:"pixels",requires:["icon-image"],expression:{interpolated:!0,parameters:["zoom"]},"property-type":"data-constant"},"icon-translate-anchor":{type:"enum",values:{map:{},viewport:{}},default:"map",requires:["icon-image","icon-translate"],expression:{interpolated:!1,parameters:["zoom"]},"property-type":"data-constant"},"text-opacity":{type:"number",default:1,minimum:0,maximum:1,transition:!0,requires:["text-field"],expression:{interpolated:!0,parameters:["zoom","feature","feature-state"]},"property-type":"data-driven"},"text-color":{type:"color",default:"#000000",transition:!0,overridable:!0,requires:["text-field"],expression:{interpolated:!0,parameters:["zoom","feature","feature-state"]},"property-type":"data-driven"},"text-halo-color":{type:"color",default:"rgba(0, 0, 0, 0)",transition:!0,requires:["text-field"],expression:{interpolated:!0,parameters:["zoom","feature","feature-state"]},"property-type":"data-driven"},"text-halo-width":{type:"number",default:0,minimum:0,transition:!0,units:"pixels",requires:["text-field"],expression:{interpolated:!0,parameters:["zoom","feature","feature-state"]},"property-type":"data-driven"},"text-halo-blur":{type:"number",default:0,minimum:0,transition:!0,units:"pixels",requires:["text-field"],expression:{interpolated:!0,parameters:["zoom","feature","feature-state"]},"property-type":"data-driven"},"text-translate":{type:"array",value:"number",length:2,default:[0,0],transition:!0,units:"pixels",requires:["text-field"],expression:{interpolated:!0,parameters:["zoom"]},"property-type":"data-constant"},"text-translate-anchor":{type:"enum",values:{map:{},viewport:{}},default:"map",requires:["text-field","text-translate"],expression:{interpolated:!1,parameters:["zoom"]},"property-type":"data-constant"}},paint_raster:{"raster-opacity":{type:"number",default:1,minimum:0,maximum:1,transition:!0,expression:{interpolated:!0,parameters:["zoom"]},"property-type":"data-constant"},"raster-hue-rotate":{type:"number",default:0,period:360,transition:!0,units:"degrees",expression:{interpolated:!0,parameters:["zoom"]},"property-type":"data-constant"},"raster-brightness-min":{type:"number",default:0,minimum:0,maximum:1,transition:!0,expression:{interpolated:!0,parameters:["zoom"]},"property-type":"data-constant"},"raster-brightness-max":{type:"number",default:1,minimum:0,maximum:1,transition:!0,expression:{interpolated:!0,parameters:["zoom"]},"property-type":"data-constant"},"raster-saturation":{type:"number",default:0,minimum:-1,maximum:1,transition:!0,expression:{interpolated:!0,parameters:["zoom"]},"property-type":"data-constant"},"raster-contrast":{type:"number",default:0,minimum:-1,maximum:1,transition:!0,expression:{interpolated:!0,parameters:["zoom"]},"property-type":"data-constant"},"raster-resampling":{type:"enum",values:{linear:{},nearest:{}},default:"linear",expression:{interpolated:!1,parameters:["zoom"]},"property-type":"data-constant"},"raster-fade-duration":{type:"number",default:300,minimum:0,transition:!1,units:"milliseconds",expression:{interpolated:!0,parameters:["zoom"]},"property-type":"data-constant"}},paint_hillshade:{"hillshade-illumination-direction":{type:"number",default:335,minimum:0,maximum:359,transition:!1,expression:{interpolated:!0,parameters:["zoom"]},"property-type":"data-constant"},"hillshade-illumination-anchor":{type:"enum",values:{map:{},viewport:{}},default:"viewport",expression:{interpolated:!1,parameters:["zoom"]},"property-type":"data-constant"},"hillshade-exaggeration":{type:"number",default:.5,minimum:0,maximum:1,transition:!0,expression:{interpolated:!0,parameters:["zoom"]},"property-type":"data-constant"},"hillshade-shadow-color":{type:"color",default:"#000000",transition:!0,expression:{interpolated:!0,parameters:["zoom"]},"property-type":"data-constant"},"hillshade-highlight-color":{type:"color",default:"#FFFFFF",transition:!0,expression:{interpolated:!0,parameters:["zoom"]},"property-type":"data-constant"},"hillshade-accent-color":{type:"color",default:"#000000",transition:!0,expression:{interpolated:!0,parameters:["zoom"]},"property-type":"data-constant"}},paint_background:{"background-color":{type:"color",default:"#000000",transition:!0,requires:[{"!":"background-pattern"}],expression:{interpolated:!0,parameters:["zoom"]},"property-type":"data-constant"},"background-pattern":{type:"resolvedImage",transition:!0,expression:{interpolated:!1,parameters:["zoom"]},"property-type":"cross-faded"},"background-opacity":{type:"number",default:1,minimum:0,maximum:1,transition:!0,expression:{interpolated:!0,parameters:["zoom"]},"property-type":"data-constant"}},transition:{duration:{type:"number",default:300,minimum:0,units:"milliseconds"},delay:{type:"number",default:0,minimum:0,units:"milliseconds"}},"property-type":{"data-driven":{type:"property-type"},"cross-faded":{type:"property-type"},"cross-faded-data-driven":{type:"property-type"},"color-ramp":{type:"property-type"},"data-constant":{type:"property-type"},constant:{type:"property-type"}},promoteId:{"*":{type:"string"}}};const j=["type","source","source-layer","minzoom","maxzoom","filter","layout"];function N(t,e){const r={};for(const e in t)"ref"!==e&&(r[e]=t[e]);return j.forEach((t=>{t in e&&(r[t]=e[t]);})),r}function Z(t,e){if(Array.isArray(t)){if(!Array.isArray(e)||t.length!==e.length)return !1;for(let r=0;r<t.length;r++)if(!Z(t[r],e[r]))return !1;return !0}if("object"==typeof t&&null!==t&&null!==e){if("object"!=typeof e)return !1;if(Object.keys(t).length!==Object.keys(e).length)return !1;for(const r in t)if(!Z(t[r],e[r]))return !1;return !0}return t===e}const K={setStyle:"setStyle",addLayer:"addLayer",removeLayer:"removeLayer",setPaintProperty:"setPaintProperty",setLayoutProperty:"setLayoutProperty",setFilter:"setFilter",addSource:"addSource",removeSource:"removeSource",setGeoJSONSourceData:"setGeoJSONSourceData",setLayerZoomRange:"setLayerZoomRange",setLayerProperty:"setLayerProperty",setCenter:"setCenter",setZoom:"setZoom",setBearing:"setBearing",setPitch:"setPitch",setSprite:"setSprite",setGlyphs:"setGlyphs",setTransition:"setTransition",setLight:"setLight"};function G(t,e,r){r.push({command:K.addSource,args:[t,e[t]]});}function J(t,e,r){e.push({command:K.removeSource,args:[t]}),r[t]=!0;}function X(t,e,r,n){J(t,r,n),G(t,e,r);}function Y(t,e,r){let n;for(n in t[r])if(Object.prototype.hasOwnProperty.call(t[r],n)&&"data"!==n&&!Z(t[r][n],e[r][n]))return !1;for(n in e[r])if(Object.prototype.hasOwnProperty.call(e[r],n)&&"data"!==n&&!Z(t[r][n],e[r][n]))return !1;return !0}function H(t,e,r,n,i,a){let s;for(s in e=e||{},t=t||{})Object.prototype.hasOwnProperty.call(t,s)&&(Z(t[s],e[s])||r.push({command:a,args:[n,s,e[s],i]}));for(s in e)Object.prototype.hasOwnProperty.call(e,s)&&!Object.prototype.hasOwnProperty.call(t,s)&&(Z(t[s],e[s])||r.push({command:a,args:[n,s,e[s],i]}));}function W(t){return t.id}function Q(t,e){return t[e.id]=e,t}class tt{constructor(t,e,r,n){this.message=(t?`${t}: `:"")+r,n&&(this.identifier=n),null!=e&&e.__line__&&(this.line=e.__line__);}}function et(t,...e){for(const r of e)for(const e in r)t[e]=r[e];return t}class rt extends Error{constructor(t,e){super(e),this.message=e,this.key=t;}}class nt{constructor(t,e=[]){this.parent=t,this.bindings={};for(const[t,r]of e)this.bindings[t]=r;}concat(t){return new nt(this,t)}get(t){if(this.bindings[t])return this.bindings[t];if(this.parent)return this.parent.get(t);throw new Error(`${t} not found in scope.`)}has(t){return !!this.bindings[t]||!!this.parent&&this.parent.has(t)}}const it={kind:"null"},at={kind:"number"},st={kind:"string"},ot={kind:"boolean"},lt={kind:"color"},ut={kind:"object"},ct={kind:"value"},ht={kind:"collator"},pt={kind:"formatted"},ft={kind:"padding"},dt={kind:"resolvedImage"},yt={kind:"variableAnchorOffsetCollection"};function mt(t,e){return {kind:"array",itemType:t,N:e}}function gt(t){if("array"===t.kind){const e=gt(t.itemType);return "number"==typeof t.N?`array<${e}, ${t.N}>`:"value"===t.itemType.kind?"array":`array<${e}>`}return t.kind}const xt=[it,at,st,ot,lt,pt,ut,mt(ct),ft,dt,yt];function vt(t,e){if("error"===e.kind)return null;if("array"===t.kind){if("array"===e.kind&&(0===e.N&&"value"===e.itemType.kind||!vt(t.itemType,e.itemType))&&("number"!=typeof t.N||t.N===e.N))return null}else {if(t.kind===e.kind)return null;if("value"===t.kind)for(const t of xt)if(!vt(t,e))return null}return `Expected ${gt(t)} but found ${gt(e)} instead.`}function bt(t,e){return e.some((e=>e.kind===t.kind))}function wt(t,e){return e.some((e=>"null"===e?null===t:"array"===e?Array.isArray(t):"object"===e?t&&!Array.isArray(t)&&"object"==typeof t:e===typeof t))}function _t(t,e){return "array"===t.kind&&"array"===e.kind?t.itemType.kind===e.itemType.kind&&"number"==typeof t.N:t.kind===e.kind}const At=.96422,St=.82521,kt=4/29,It=6/29,zt=3*It*It,Mt=It*It*It,Pt=Math.PI/180,Bt=180/Math.PI;function Ct(t){return (t%=360)<0&&(t+=360),t}function Vt([t,e,r,n]){let i,a;const s=Tt((.2225045*(t=Et(t))+.7168786*(e=Et(e))+.0606169*(r=Et(r)))/1);t===e&&e===r?i=a=s:(i=Tt((.4360747*t+.3850649*e+.1430804*r)/At),a=Tt((.0139322*t+.0971045*e+.7141733*r)/St));const o=116*s-16;return [o<0?0:o,500*(i-s),200*(s-a),n]}function Et(t){return t<=.04045?t/12.92:Math.pow((t+.055)/1.055,2.4)}function Tt(t){return t>Mt?Math.pow(t,1/3):t/zt+kt}function Ft([t,e,r,n]){let i=(t+16)/116,a=isNaN(e)?i:i+e/500,s=isNaN(r)?i:i-r/200;return i=1*$t(i),a=At*$t(a),s=St*$t(s),[Lt(3.1338561*a-1.6168667*i-.4906146*s),Lt(-.9787684*a+1.9161415*i+.033454*s),Lt(.0719453*a-.2289914*i+1.4052427*s),n]}function Lt(t){return (t=t<=.00304?12.92*t:1.055*Math.pow(t,1/2.4)-.055)<0?0:t>1?1:t}function $t(t){return t>It?t*t*t:zt*(t-kt)}function Dt(t){return parseInt(t.padEnd(2,t),16)/255}function Ot(t,e){return Ut(e?t/100:t,0,1)}function Ut(t,e,r){return Math.min(Math.max(e,t),r)}function Rt(t){return !t.some(Number.isNaN)}const qt={aliceblue:[240,248,255],antiquewhite:[250,235,215],aqua:[0,255,255],aquamarine:[127,255,212],azure:[240,255,255],beige:[245,245,220],bisque:[255,228,196],black:[0,0,0],blanchedalmond:[255,235,205],blue:[0,0,255],blueviolet:[138,43,226],brown:[165,42,42],burlywood:[222,184,135],cadetblue:[95,158,160],chartreuse:[127,255,0],chocolate:[210,105,30],coral:[255,127,80],cornflowerblue:[100,149,237],cornsilk:[255,248,220],crimson:[220,20,60],cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgoldenrod:[184,134,11],darkgray:[169,169,169],darkgreen:[0,100,0],darkgrey:[169,169,169],darkkhaki:[189,183,107],darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],darkred:[139,0,0],darksalmon:[233,150,122],darkseagreen:[143,188,143],darkslateblue:[72,61,139],darkslategray:[47,79,79],darkslategrey:[47,79,79],darkturquoise:[0,206,209],darkviolet:[148,0,211],deeppink:[255,20,147],deepskyblue:[0,191,255],dimgray:[105,105,105],dimgrey:[105,105,105],dodgerblue:[30,144,255],firebrick:[178,34,34],floralwhite:[255,250,240],forestgreen:[34,139,34],fuchsia:[255,0,255],gainsboro:[220,220,220],ghostwhite:[248,248,255],gold:[255,215,0],goldenrod:[218,165,32],gray:[128,128,128],green:[0,128,0],greenyellow:[173,255,47],grey:[128,128,128],honeydew:[240,255,240],hotpink:[255,105,180],indianred:[205,92,92],indigo:[75,0,130],ivory:[255,255,240],khaki:[240,230,140],lavender:[230,230,250],lavenderblush:[255,240,245],lawngreen:[124,252,0],lemonchiffon:[255,250,205],lightblue:[173,216,230],lightcoral:[240,128,128],lightcyan:[224,255,255],lightgoldenrodyellow:[250,250,210],lightgray:[211,211,211],lightgreen:[144,238,144],lightgrey:[211,211,211],lightpink:[255,182,193],lightsalmon:[255,160,122],lightseagreen:[32,178,170],lightskyblue:[135,206,250],lightslategray:[119,136,153],lightslategrey:[119,136,153],lightsteelblue:[176,196,222],lightyellow:[255,255,224],lime:[0,255,0],limegreen:[50,205,50],linen:[250,240,230],magenta:[255,0,255],maroon:[128,0,0],mediumaquamarine:[102,205,170],mediumblue:[0,0,205],mediumorchid:[186,85,211],mediumpurple:[147,112,219],mediumseagreen:[60,179,113],mediumslateblue:[123,104,238],mediumspringgreen:[0,250,154],mediumturquoise:[72,209,204],mediumvioletred:[199,21,133],midnightblue:[25,25,112],mintcream:[245,255,250],mistyrose:[255,228,225],moccasin:[255,228,181],navajowhite:[255,222,173],navy:[0,0,128],oldlace:[253,245,230],olive:[128,128,0],olivedrab:[107,142,35],orange:[255,165,0],orangered:[255,69,0],orchid:[218,112,214],palegoldenrod:[238,232,170],palegreen:[152,251,152],paleturquoise:[175,238,238],palevioletred:[219,112,147],papayawhip:[255,239,213],peachpuff:[255,218,185],peru:[205,133,63],pink:[255,192,203],plum:[221,160,221],powderblue:[176,224,230],purple:[128,0,128],rebeccapurple:[102,51,153],red:[255,0,0],rosybrown:[188,143,143],royalblue:[65,105,225],saddlebrown:[139,69,19],salmon:[250,128,114],sandybrown:[244,164,96],seagreen:[46,139,87],seashell:[255,245,238],sienna:[160,82,45],silver:[192,192,192],skyblue:[135,206,235],slateblue:[106,90,205],slategray:[112,128,144],slategrey:[112,128,144],snow:[255,250,250],springgreen:[0,255,127],steelblue:[70,130,180],tan:[210,180,140],teal:[0,128,128],thistle:[216,191,216],tomato:[255,99,71],turquoise:[64,224,208],violet:[238,130,238],wheat:[245,222,179],white:[255,255,255],whitesmoke:[245,245,245],yellow:[255,255,0],yellowgreen:[154,205,50]};class jt{constructor(t,e,r,n=1,i=!0){this.r=t,this.g=e,this.b=r,this.a=n,i||(this.r*=n,this.g*=n,this.b*=n,n||this.overwriteGetter("rgb",[t,e,r,n]));}static parse(t){if(t instanceof jt)return t;if("string"!=typeof t)return;const e=function(t){if("transparent"===(t=t.toLowerCase().trim()))return [0,0,0,0];const e=qt[t];if(e){const[t,r,n]=e;return [t/255,r/255,n/255,1]}if(t.startsWith("#")&&/^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.test(t)){const e=t.length<6?1:2;let r=1;return [Dt(t.slice(r,r+=e)),Dt(t.slice(r,r+=e)),Dt(t.slice(r,r+=e)),Dt(t.slice(r,r+e)||"ff")]}if(t.startsWith("rgb")){const e=t.match(/^rgba?\(\s*([\de.+-]+)(%)?(?:\s+|\s*(,)\s*)([\de.+-]+)(%)?(?:\s+|\s*(,)\s*)([\de.+-]+)(%)?(?:\s*([,\/])\s*([\de.+-]+)(%)?)?\s*\)$/);if(e){const[t,r,n,i,a,s,o,l,u,c,h,p]=e,f=[i||" ",o||" ",c].join("");if("  "===f||"  /"===f||",,"===f||",,,"===f){const t=[n,s,u].join(""),e="%%%"===t?100:""===t?255:0;if(e){const t=[Ut(+r/e,0,1),Ut(+a/e,0,1),Ut(+l/e,0,1),h?Ot(+h,p):1];if(Rt(t))return t}}return}}const r=t.match(/^hsla?\(\s*([\de.+-]+)(?:deg)?(?:\s+|\s*(,)\s*)([\de.+-]+)%(?:\s+|\s*(,)\s*)([\de.+-]+)%(?:\s*([,\/])\s*([\de.+-]+)(%)?)?\s*\)$/);if(r){const[t,e,n,i,a,s,o,l,u]=r,c=[n||" ",a||" ",o].join("");if("  "===c||"  /"===c||",,"===c||",,,"===c){const t=[+e,Ut(+i,0,100),Ut(+s,0,100),l?Ot(+l,u):1];if(Rt(t))return function([t,e,r,n]){function i(n){const i=(n+t/30)%12,a=e*Math.min(r,1-r);return r-a*Math.max(-1,Math.min(i-3,9-i,1))}return t=Ct(t),e/=100,r/=100,[i(0),i(8),i(4),n]}(t)}}}(t);return e?new jt(...e,!1):void 0}get rgb(){const{r:t,g:e,b:r,a:n}=this,i=n||1/0;return this.overwriteGetter("rgb",[t/i,e/i,r/i,n])}get hcl(){return this.overwriteGetter("hcl",function(t){const[e,r,n,i]=Vt(t),a=Math.sqrt(r*r+n*n);return [Math.round(1e4*a)?Ct(Math.atan2(n,r)*Bt):NaN,a,e,i]}(this.rgb))}get lab(){return this.overwriteGetter("lab",Vt(this.rgb))}overwriteGetter(t,e){return Object.defineProperty(this,t,{value:e}),e}toString(){const[t,e,r,n]=this.rgb;return `rgba(${[t,e,r].map((t=>Math.round(255*t))).join(",")},${n})`}}jt.black=new jt(0,0,0,1),jt.white=new jt(1,1,1,1),jt.transparent=new jt(0,0,0,0),jt.red=new jt(1,0,0,1);class Nt{constructor(t,e,r){this.sensitivity=t?e?"variant":"case":e?"accent":"base",this.locale=r,this.collator=new Intl.Collator(this.locale?this.locale:[],{sensitivity:this.sensitivity,usage:"search"});}compare(t,e){return this.collator.compare(t,e)}resolvedLocale(){return new Intl.Collator(this.locale?this.locale:[]).resolvedOptions().locale}}class Zt{constructor(t,e,r,n,i){this.text=t,this.image=e,this.scale=r,this.fontStack=n,this.textColor=i;}}class Kt{constructor(t){this.sections=t;}static fromString(t){return new Kt([new Zt(t,null,null,null,null)])}isEmpty(){return 0===this.sections.length||!this.sections.some((t=>0!==t.text.length||t.image&&0!==t.image.name.length))}static factory(t){return t instanceof Kt?t:Kt.fromString(t)}toString(){return 0===this.sections.length?"":this.sections.map((t=>t.text)).join("")}}class Gt{constructor(t){this.values=t.slice();}static parse(t){if(t instanceof Gt)return t;if("number"==typeof t)return new Gt([t,t,t,t]);if(Array.isArray(t)&&!(t.length<1||t.length>4)){for(const e of t)if("number"!=typeof e)return;switch(t.length){case 1:t=[t[0],t[0],t[0],t[0]];break;case 2:t=[t[0],t[1],t[0],t[1]];break;case 3:t=[t[0],t[1],t[2],t[1]];}return new Gt(t)}}toString(){return JSON.stringify(this.values)}}const Jt=new Set(["center","left","right","top","bottom","top-left","top-right","bottom-left","bottom-right"]);class Xt{constructor(t){this.values=t.slice();}static parse(t){if(t instanceof Xt)return t;if(Array.isArray(t)&&!(t.length<1)&&t.length%2==0){for(let e=0;e<t.length;e+=2){const r=t[e],n=t[e+1];if("string"!=typeof r||!Jt.has(r))return;if(!Array.isArray(n)||2!==n.length||"number"!=typeof n[0]||"number"!=typeof n[1])return}return new Xt(t)}}toString(){return JSON.stringify(this.values)}}class Yt{constructor(t){this.name=t.name,this.available=t.available;}toString(){return this.name}static fromString(t){return t?new Yt({name:t,available:!1}):null}}function Ht(t,e,r,n){return "number"==typeof t&&t>=0&&t<=255&&"number"==typeof e&&e>=0&&e<=255&&"number"==typeof r&&r>=0&&r<=255?void 0===n||"number"==typeof n&&n>=0&&n<=1?null:`Invalid rgba value [${[t,e,r,n].join(", ")}]: 'a' must be between 0 and 1.`:`Invalid rgba value [${("number"==typeof n?[t,e,r,n]:[t,e,r]).join(", ")}]: 'r', 'g', and 'b' must be between 0 and 255.`}function Wt(t){if(null===t||"string"==typeof t||"boolean"==typeof t||"number"==typeof t||t instanceof jt||t instanceof Nt||t instanceof Kt||t instanceof Gt||t instanceof Xt||t instanceof Yt)return !0;if(Array.isArray(t)){for(const e of t)if(!Wt(e))return !1;return !0}if("object"==typeof t){for(const e in t)if(!Wt(t[e]))return !1;return !0}return !1}function Qt(t){if(null===t)return it;if("string"==typeof t)return st;if("boolean"==typeof t)return ot;if("number"==typeof t)return at;if(t instanceof jt)return lt;if(t instanceof Nt)return ht;if(t instanceof Kt)return pt;if(t instanceof Gt)return ft;if(t instanceof Xt)return yt;if(t instanceof Yt)return dt;if(Array.isArray(t)){const e=t.length;let r;for(const e of t){const t=Qt(e);if(r){if(r===t)continue;r=ct;break}r=t;}return mt(r||ct,e)}return ut}function te(t){const e=typeof t;return null===t?"":"string"===e||"number"===e||"boolean"===e?String(t):t instanceof jt||t instanceof Kt||t instanceof Gt||t instanceof Xt||t instanceof Yt?t.toString():JSON.stringify(t)}class ee{constructor(t,e){this.type=t,this.value=e;}static parse(t,e){if(2!==t.length)return e.error(`'literal' expression requires exactly one argument, but found ${t.length-1} instead.`);if(!Wt(t[1]))return e.error("invalid value");const r=t[1];let n=Qt(r);const i=e.expectedType;return "array"!==n.kind||0!==n.N||!i||"array"!==i.kind||"number"==typeof i.N&&0!==i.N||(n=i),new ee(n,r)}evaluate(){return this.value}eachChild(){}outputDefined(){return !0}}class re{constructor(t){this.name="ExpressionEvaluationError",this.message=t;}toJSON(){return this.message}}const ne={string:st,number:at,boolean:ot,object:ut};class ie{constructor(t,e){this.type=t,this.args=e;}static parse(t,e){if(t.length<2)return e.error("Expected at least one argument.");let r,n=1;const i=t[0];if("array"===i){let i,a;if(t.length>2){const r=t[1];if("string"!=typeof r||!(r in ne)||"object"===r)return e.error('The item type argument of "array" must be one of string, number, boolean',1);i=ne[r],n++;}else i=ct;if(t.length>3){if(null!==t[2]&&("number"!=typeof t[2]||t[2]<0||t[2]!==Math.floor(t[2])))return e.error('The length argument to "array" must be a positive integer literal',2);a=t[2],n++;}r=mt(i,a);}else {if(!ne[i])throw new Error(`Types doesn't contain name = ${i}`);r=ne[i];}const a=[];for(;n<t.length;n++){const r=e.parse(t[n],n,ct);if(!r)return null;a.push(r);}return new ie(r,a)}evaluate(t){for(let e=0;e<this.args.length;e++){const r=this.args[e].evaluate(t);if(!vt(this.type,Qt(r)))return r;if(e===this.args.length-1)throw new re(`Expected value to be of type ${gt(this.type)}, but found ${gt(Qt(r))} instead.`)}throw new Error}eachChild(t){this.args.forEach(t);}outputDefined(){return this.args.every((t=>t.outputDefined()))}}const ae={"to-boolean":ot,"to-color":lt,"to-number":at,"to-string":st};class se{constructor(t,e){this.type=t,this.args=e;}static parse(t,e){if(t.length<2)return e.error("Expected at least one argument.");const r=t[0];if(!ae[r])throw new Error(`Can't parse ${r} as it is not part of the known types`);if(("to-boolean"===r||"to-string"===r)&&2!==t.length)return e.error("Expected one argument.");const n=ae[r],i=[];for(let r=1;r<t.length;r++){const n=e.parse(t[r],r,ct);if(!n)return null;i.push(n);}return new se(n,i)}evaluate(t){switch(this.type.kind){case"boolean":return Boolean(this.args[0].evaluate(t));case"color":{let e,r;for(const n of this.args){if(e=n.evaluate(t),r=null,e instanceof jt)return e;if("string"==typeof e){const r=t.parseColor(e);if(r)return r}else if(Array.isArray(e)&&(r=e.length<3||e.length>4?`Invalid rbga value ${JSON.stringify(e)}: expected an array containing either three or four numeric values.`:Ht(e[0],e[1],e[2],e[3]),!r))return new jt(e[0]/255,e[1]/255,e[2]/255,e[3])}throw new re(r||`Could not parse color from value '${"string"==typeof e?e:JSON.stringify(e)}'`)}case"padding":{let e;for(const r of this.args){e=r.evaluate(t);const n=Gt.parse(e);if(n)return n}throw new re(`Could not parse padding from value '${"string"==typeof e?e:JSON.stringify(e)}'`)}case"variableAnchorOffsetCollection":{let e;for(const r of this.args){e=r.evaluate(t);const n=Xt.parse(e);if(n)return n}throw new re(`Could not parse variableAnchorOffsetCollection from value '${"string"==typeof e?e:JSON.stringify(e)}'`)}case"number":{let e=null;for(const r of this.args){if(e=r.evaluate(t),null===e)return 0;const n=Number(e);if(!isNaN(n))return n}throw new re(`Could not convert ${JSON.stringify(e)} to number.`)}case"formatted":return Kt.fromString(te(this.args[0].evaluate(t)));case"resolvedImage":return Yt.fromString(te(this.args[0].evaluate(t)));default:return te(this.args[0].evaluate(t))}}eachChild(t){this.args.forEach(t);}outputDefined(){return this.args.every((t=>t.outputDefined()))}}const oe=["Unknown","Point","LineString","Polygon"];class le{constructor(){this.globals=null,this.feature=null,this.featureState=null,this.formattedSection=null,this._parseColorCache={},this.availableImages=null,this.canonical=null;}id(){return this.feature&&"id"in this.feature?this.feature.id:null}geometryType(){return this.feature?"number"==typeof this.feature.type?oe[this.feature.type]:this.feature.type:null}geometry(){return this.feature&&"geometry"in this.feature?this.feature.geometry:null}canonicalID(){return this.canonical}properties(){return this.feature&&this.feature.properties||{}}parseColor(t){let e=this._parseColorCache[t];return e||(e=this._parseColorCache[t]=jt.parse(t)),e}}class ue{constructor(t,e,r=[],n,i=new nt,a=[]){this.registry=t,this.path=r,this.key=r.map((t=>`[${t}]`)).join(""),this.scope=i,this.errors=a,this.expectedType=n,this._isConstant=e;}parse(t,e,r,n,i={}){return e?this.concat(e,r,n)._parse(t,i):this._parse(t,i)}_parse(t,e){function r(t,e,r){return "assert"===r?new ie(e,[t]):"coerce"===r?new se(e,[t]):t}if(null!==t&&"string"!=typeof t&&"boolean"!=typeof t&&"number"!=typeof t||(t=["literal",t]),Array.isArray(t)){if(0===t.length)return this.error('Expected an array with at least one element. If you wanted a literal array, use ["literal", []].');const n=t[0];if("string"!=typeof n)return this.error(`Expression name must be a string, but found ${typeof n} instead. If you wanted a literal array, use ["literal", [...]].`,0),null;const i=this.registry[n];if(i){let n=i.parse(t,this);if(!n)return null;if(this.expectedType){const t=this.expectedType,i=n.type;if("string"!==t.kind&&"number"!==t.kind&&"boolean"!==t.kind&&"object"!==t.kind&&"array"!==t.kind||"value"!==i.kind)if("color"!==t.kind&&"formatted"!==t.kind&&"resolvedImage"!==t.kind||"value"!==i.kind&&"string"!==i.kind)if("padding"!==t.kind||"value"!==i.kind&&"number"!==i.kind&&"array"!==i.kind)if("variableAnchorOffsetCollection"!==t.kind||"value"!==i.kind&&"array"!==i.kind){if(this.checkSubtype(t,i))return null}else n=r(n,t,e.typeAnnotation||"coerce");else n=r(n,t,e.typeAnnotation||"coerce");else n=r(n,t,e.typeAnnotation||"coerce");else n=r(n,t,e.typeAnnotation||"assert");}if(!(n instanceof ee)&&"resolvedImage"!==n.type.kind&&this._isConstant(n)){const t=new le;try{n=new ee(n.type,n.evaluate(t));}catch(t){return this.error(t.message),null}}return n}return this.error(`Unknown expression "${n}". If you wanted a literal array, use ["literal", [...]].`,0)}return this.error(void 0===t?"'undefined' value invalid. Use null instead.":"object"==typeof t?'Bare objects invalid. Use ["literal", {...}] instead.':`Expected an array, but found ${typeof t} instead.`)}concat(t,e,r){const n="number"==typeof t?this.path.concat(t):this.path,i=r?this.scope.concat(r):this.scope;return new ue(this.registry,this._isConstant,n,e||null,i,this.errors)}error(t,...e){const r=`${this.key}${e.map((t=>`[${t}]`)).join("")}`;this.errors.push(new rt(r,t));}checkSubtype(t,e){const r=vt(t,e);return r&&this.error(r),r}}class ce{constructor(t,e,r){this.type=ht,this.locale=r,this.caseSensitive=t,this.diacriticSensitive=e;}static parse(t,e){if(2!==t.length)return e.error("Expected one argument.");const r=t[1];if("object"!=typeof r||Array.isArray(r))return e.error("Collator options argument must be an object.");const n=e.parse(void 0!==r["case-sensitive"]&&r["case-sensitive"],1,ot);if(!n)return null;const i=e.parse(void 0!==r["diacritic-sensitive"]&&r["diacritic-sensitive"],1,ot);if(!i)return null;let a=null;return r.locale&&(a=e.parse(r.locale,1,st),!a)?null:new ce(n,i,a)}evaluate(t){return new Nt(this.caseSensitive.evaluate(t),this.diacriticSensitive.evaluate(t),this.locale?this.locale.evaluate(t):null)}eachChild(t){t(this.caseSensitive),t(this.diacriticSensitive),this.locale&&t(this.locale);}outputDefined(){return !1}}const he=8192;function pe(t,e){t[0]=Math.min(t[0],e[0]),t[1]=Math.min(t[1],e[1]),t[2]=Math.max(t[2],e[0]),t[3]=Math.max(t[3],e[1]);}function fe(t,e){return !(t[0]<=e[0]||t[2]>=e[2]||t[1]<=e[1]||t[3]>=e[3])}function de(t,e){const r=(180+t[0])/360,n=(180-180/Math.PI*Math.log(Math.tan(Math.PI/4+t[1]*Math.PI/360)))/360,i=Math.pow(2,e.z);return [Math.round(r*i*he),Math.round(n*i*he)]}function ye(t,e,r){const n=t[0]-e[0],i=t[1]-e[1],a=t[0]-r[0],s=t[1]-r[1];return n*s-a*i==0&&n*a<=0&&i*s<=0}function me(t,e){let r=!1;for(let s=0,o=e.length;s<o;s++){const o=e[s];for(let e=0,s=o.length;e<s-1;e++){if(ye(t,o[e],o[e+1]))return !1;(i=o[e])[1]>(n=t)[1]!=(a=o[e+1])[1]>n[1]&&n[0]<(a[0]-i[0])*(n[1]-i[1])/(a[1]-i[1])+i[0]&&(r=!r);}}var n,i,a;return r}function ge(t,e){for(let r=0;r<e.length;r++)if(me(t,e[r]))return !0;return !1}function xe(t,e,r,n){const i=n[0]-r[0],a=n[1]-r[1],s=(t[0]-r[0])*a-i*(t[1]-r[1]),o=(e[0]-r[0])*a-i*(e[1]-r[1]);return s>0&&o<0||s<0&&o>0}function ve(t,e,r){for(const u of r)for(let r=0;r<u.length-1;++r)if(0!=(o=[(s=u[r+1])[0]-(a=u[r])[0],s[1]-a[1]])[0]*(l=[(i=e)[0]-(n=t)[0],i[1]-n[1]])[1]-o[1]*l[0]&&xe(n,i,a,s)&&xe(a,s,n,i))return !0;var n,i,a,s,o,l;return !1}function be(t,e){for(let r=0;r<t.length;++r)if(!me(t[r],e))return !1;for(let r=0;r<t.length-1;++r)if(ve(t[r],t[r+1],e))return !1;return !0}function we(t,e){for(let r=0;r<e.length;r++)if(be(t,e[r]))return !0;return !1}function _e(t,e,r){const n=[];for(let i=0;i<t.length;i++){const a=[];for(let n=0;n<t[i].length;n++){const s=de(t[i][n],r);pe(e,s),a.push(s);}n.push(a);}return n}function Ae(t,e,r){const n=[];for(let i=0;i<t.length;i++){const a=_e(t[i],e,r);n.push(a);}return n}function Se(t,e,r,n){if(t[0]<r[0]||t[0]>r[2]){const e=.5*n;let i=t[0]-r[0]>e?-n:r[0]-t[0]>e?n:0;0===i&&(i=t[0]-r[2]>e?-n:r[2]-t[0]>e?n:0),t[0]+=i;}pe(e,t);}function ke(t,e,r,n){const i=Math.pow(2,n.z)*he,a=[n.x*he,n.y*he],s=[];for(const n of t)for(const t of n){const n=[t.x+a[0],t.y+a[1]];Se(n,e,r,i),s.push(n);}return s}function Ie(t,e,r,n){const i=Math.pow(2,n.z)*he,a=[n.x*he,n.y*he],s=[];for(const r of t){const t=[];for(const n of r){const r=[n.x+a[0],n.y+a[1]];pe(e,r),t.push(r);}s.push(t);}if(e[2]-e[0]<=i/2){(o=e)[0]=o[1]=1/0,o[2]=o[3]=-1/0;for(const t of s)for(const n of t)Se(n,e,r,i);}var o;return s}class ze{constructor(t,e){this.type=ot,this.geojson=t,this.geometries=e;}static parse(t,e){if(2!==t.length)return e.error(`'within' expression requires exactly one argument, but found ${t.length-1} instead.`);if(Wt(t[1])){const e=t[1];if("FeatureCollection"===e.type)for(let t=0;t<e.features.length;++t){const r=e.features[t].geometry.type;if("Polygon"===r||"MultiPolygon"===r)return new ze(e,e.features[t].geometry)}else if("Feature"===e.type){const t=e.geometry.type;if("Polygon"===t||"MultiPolygon"===t)return new ze(e,e.geometry)}else if("Polygon"===e.type||"MultiPolygon"===e.type)return new ze(e,e)}return e.error("'within' expression requires valid geojson object that contains polygon geometry type.")}evaluate(t){if(null!=t.geometry()&&null!=t.canonicalID()){if("Point"===t.geometryType())return function(t,e){const r=[1/0,1/0,-1/0,-1/0],n=[1/0,1/0,-1/0,-1/0],i=t.canonicalID();if("Polygon"===e.type){const a=_e(e.coordinates,n,i),s=ke(t.geometry(),r,n,i);if(!fe(r,n))return !1;for(const t of s)if(!me(t,a))return !1}if("MultiPolygon"===e.type){const a=Ae(e.coordinates,n,i),s=ke(t.geometry(),r,n,i);if(!fe(r,n))return !1;for(const t of s)if(!ge(t,a))return !1}return !0}(t,this.geometries);if("LineString"===t.geometryType())return function(t,e){const r=[1/0,1/0,-1/0,-1/0],n=[1/0,1/0,-1/0,-1/0],i=t.canonicalID();if("Polygon"===e.type){const a=_e(e.coordinates,n,i),s=Ie(t.geometry(),r,n,i);if(!fe(r,n))return !1;for(const t of s)if(!be(t,a))return !1}if("MultiPolygon"===e.type){const a=Ae(e.coordinates,n,i),s=Ie(t.geometry(),r,n,i);if(!fe(r,n))return !1;for(const t of s)if(!we(t,a))return !1}return !0}(t,this.geometries)}return !1}eachChild(){}outputDefined(){return !0}}class Me{constructor(t,e){this.type=e.type,this.name=t,this.boundExpression=e;}static parse(t,e){if(2!==t.length||"string"!=typeof t[1])return e.error("'var' expression requires exactly one string literal argument.");const r=t[1];return e.scope.has(r)?new Me(r,e.scope.get(r)):e.error(`Unknown variable "${r}". Make sure "${r}" has been bound in an enclosing "let" expression before using it.`,1)}evaluate(t){return this.boundExpression.evaluate(t)}eachChild(){}outputDefined(){return !1}}class Pe{constructor(t,e,r,n){this.name=t,this.type=e,this._evaluate=r,this.args=n;}evaluate(t){return this._evaluate(t,this.args)}eachChild(t){this.args.forEach(t);}outputDefined(){return !1}static parse(t,e){const r=t[0],n=Pe.definitions[r];if(!n)return e.error(`Unknown expression "${r}". If you wanted a literal array, use ["literal", [...]].`,0);const i=Array.isArray(n)?n[0]:n.type,a=Array.isArray(n)?[[n[1],n[2]]]:n.overloads,s=a.filter((([e])=>!Array.isArray(e)||e.length===t.length-1));let o=null;for(const[n,a]of s){o=new ue(e.registry,Be,e.path,null,e.scope);const s=[];let l=!1;for(let e=1;e<t.length;e++){const r=t[e],i=Array.isArray(n)?n[e-1]:n.type,a=o.parse(r,1+s.length,i);if(!a){l=!0;break}s.push(a);}if(!l)if(Array.isArray(n)&&n.length!==s.length)o.error(`Expected ${n.length} arguments, but found ${s.length} instead.`);else {for(let t=0;t<s.length;t++){const e=Array.isArray(n)?n[t]:n.type,r=s[t];o.concat(t+1).checkSubtype(e,r.type);}if(0===o.errors.length)return new Pe(r,i,a,s)}}if(1===s.length)e.errors.push(...o.errors);else {const r=(s.length?s:a).map((([t])=>{return e=t,Array.isArray(e)?`(${e.map(gt).join(", ")})`:`(${gt(e.type)}...)`;var e;})).join(" | "),n=[];for(let r=1;r<t.length;r++){const i=e.parse(t[r],1+n.length);if(!i)return null;n.push(gt(i.type));}e.error(`Expected arguments of type ${r}, but found (${n.join(", ")}) instead.`);}return null}static register(t,e){Pe.definitions=e;for(const r in e)t[r]=Pe;}}function Be(t){if(t instanceof Me)return Be(t.boundExpression);if(t instanceof Pe&&"error"===t.name)return !1;if(t instanceof ce)return !1;if(t instanceof ze)return !1;const e=t instanceof se||t instanceof ie;let r=!0;return t.eachChild((t=>{r=e?r&&Be(t):r&&t instanceof ee;})),!!r&&Ce(t)&&Ee(t,["zoom","heatmap-density","line-progress","accumulated","is-supported-script"])}function Ce(t){if(t instanceof Pe){if("get"===t.name&&1===t.args.length)return !1;if("feature-state"===t.name)return !1;if("has"===t.name&&1===t.args.length)return !1;if("properties"===t.name||"geometry-type"===t.name||"id"===t.name)return !1;if(/^filter-/.test(t.name))return !1}if(t instanceof ze)return !1;let e=!0;return t.eachChild((t=>{e&&!Ce(t)&&(e=!1);})),e}function Ve(t){if(t instanceof Pe&&"feature-state"===t.name)return !1;let e=!0;return t.eachChild((t=>{e&&!Ve(t)&&(e=!1);})),e}function Ee(t,e){if(t instanceof Pe&&e.indexOf(t.name)>=0)return !1;let r=!0;return t.eachChild((t=>{r&&!Ee(t,e)&&(r=!1);})),r}function Te(t,e){const r=t.length-1;let n,i,a=0,s=r,o=0;for(;a<=s;)if(o=Math.floor((a+s)/2),n=t[o],i=t[o+1],n<=e){if(o===r||e<i)return o;a=o+1;}else {if(!(n>e))throw new re("Input is not a number.");s=o-1;}return 0}class Fe{constructor(t,e,r){this.type=t,this.input=e,this.labels=[],this.outputs=[];for(const[t,e]of r)this.labels.push(t),this.outputs.push(e);}static parse(t,e){if(t.length-1<4)return e.error(`Expected at least 4 arguments, but found only ${t.length-1}.`);if((t.length-1)%2!=0)return e.error("Expected an even number of arguments.");const r=e.parse(t[1],1,at);if(!r)return null;const n=[];let i=null;e.expectedType&&"value"!==e.expectedType.kind&&(i=e.expectedType);for(let r=1;r<t.length;r+=2){const a=1===r?-1/0:t[r],s=t[r+1],o=r,l=r+1;if("number"!=typeof a)return e.error('Input/output pairs for "step" expressions must be defined using literal numeric values (not computed expressions) for the input values.',o);if(n.length&&n[n.length-1][0]>=a)return e.error('Input/output pairs for "step" expressions must be arranged with input values in strictly ascending order.',o);const u=e.parse(s,l,i);if(!u)return null;i=i||u.type,n.push([a,u]);}return new Fe(i,r,n)}evaluate(t){const e=this.labels,r=this.outputs;if(1===e.length)return r[0].evaluate(t);const n=this.input.evaluate(t);if(n<=e[0])return r[0].evaluate(t);const i=e.length;return n>=e[i-1]?r[i-1].evaluate(t):r[Te(e,n)].evaluate(t)}eachChild(t){t(this.input);for(const e of this.outputs)t(e);}outputDefined(){return this.outputs.every((t=>t.outputDefined()))}}function Le(t,e,r){return t+r*(e-t)}function $e(t,e,r){return t.map(((t,n)=>Le(t,e[n],r)))}const De={number:Le,color:function(t,e,r,n="rgb"){switch(n){case"rgb":{const[n,i,a,s]=$e(t.rgb,e.rgb,r);return new jt(n,i,a,s,!1)}case"hcl":{const[n,i,a,s]=t.hcl,[o,l,u,c]=e.hcl;let h,p;if(isNaN(n)||isNaN(o))isNaN(n)?isNaN(o)?h=NaN:(h=o,1!==a&&0!==a||(p=l)):(h=n,1!==u&&0!==u||(p=i));else {let t=o-n;o>n&&t>180?t-=360:o<n&&n-o>180&&(t+=360),h=n+r*t;}const[f,d,y,m]=function([t,e,r,n]){return t=isNaN(t)?0:t*Pt,Ft([r,Math.cos(t)*e,Math.sin(t)*e,n])}([h,null!=p?p:Le(i,l,r),Le(a,u,r),Le(s,c,r)]);return new jt(f,d,y,m,!1)}case"lab":{const[n,i,a,s]=Ft($e(t.lab,e.lab,r));return new jt(n,i,a,s,!1)}}},array:$e,padding:function(t,e,r){return new Gt($e(t.values,e.values,r))},variableAnchorOffsetCollection:function(t,e,r){const n=t.values,i=e.values;if(n.length!==i.length)throw new re(`Cannot interpolate values of different length. from: ${t.toString()}, to: ${e.toString()}`);const a=[];for(let t=0;t<n.length;t+=2){if(n[t]!==i[t])throw new re(`Cannot interpolate values containing mismatched anchors. from[${t}]: ${n[t]}, to[${t}]: ${i[t]}`);a.push(n[t]);const[e,s]=n[t+1],[o,l]=i[t+1];a.push([Le(e,o,r),Le(s,l,r)]);}return new Xt(a)}};class Oe{constructor(t,e,r,n,i){this.type=t,this.operator=e,this.interpolation=r,this.input=n,this.labels=[],this.outputs=[];for(const[t,e]of i)this.labels.push(t),this.outputs.push(e);}static interpolationFactor(t,e,r,n){let i=0;if("exponential"===t.name)i=Ue(e,t.base,r,n);else if("linear"===t.name)i=Ue(e,1,r,n);else if("cubic-bezier"===t.name){const a=t.controlPoints;i=new o(a[0],a[1],a[2],a[3]).solve(Ue(e,1,r,n));}return i}static parse(t,e){let[r,n,i,...a]=t;if(!Array.isArray(n)||0===n.length)return e.error("Expected an interpolation type expression.",1);if("linear"===n[0])n={name:"linear"};else if("exponential"===n[0]){const t=n[1];if("number"!=typeof t)return e.error("Exponential interpolation requires a numeric base.",1,1);n={name:"exponential",base:t};}else {if("cubic-bezier"!==n[0])return e.error(`Unknown interpolation type ${String(n[0])}`,1,0);{const t=n.slice(1);if(4!==t.length||t.some((t=>"number"!=typeof t||t<0||t>1)))return e.error("Cubic bezier interpolation requires four numeric arguments with values between 0 and 1.",1);n={name:"cubic-bezier",controlPoints:t};}}if(t.length-1<4)return e.error(`Expected at least 4 arguments, but found only ${t.length-1}.`);if((t.length-1)%2!=0)return e.error("Expected an even number of arguments.");if(i=e.parse(i,2,at),!i)return null;const s=[];let o=null;"interpolate-hcl"===r||"interpolate-lab"===r?o=lt:e.expectedType&&"value"!==e.expectedType.kind&&(o=e.expectedType);for(let t=0;t<a.length;t+=2){const r=a[t],n=a[t+1],i=t+3,l=t+4;if("number"!=typeof r)return e.error('Input/output pairs for "interpolate" expressions must be defined using literal numeric values (not computed expressions) for the input values.',i);if(s.length&&s[s.length-1][0]>=r)return e.error('Input/output pairs for "interpolate" expressions must be arranged with input values in strictly ascending order.',i);const u=e.parse(n,l,o);if(!u)return null;o=o||u.type,s.push([r,u]);}return _t(o,at)||_t(o,lt)||_t(o,ft)||_t(o,yt)||_t(o,mt(at))?new Oe(o,r,n,i,s):e.error(`Type ${gt(o)} is not interpolatable.`)}evaluate(t){const e=this.labels,r=this.outputs;if(1===e.length)return r[0].evaluate(t);const n=this.input.evaluate(t);if(n<=e[0])return r[0].evaluate(t);const i=e.length;if(n>=e[i-1])return r[i-1].evaluate(t);const a=Te(e,n),s=Oe.interpolationFactor(this.interpolation,n,e[a],e[a+1]),o=r[a].evaluate(t),l=r[a+1].evaluate(t);switch(this.operator){case"interpolate":return De[this.type.kind](o,l,s);case"interpolate-hcl":return De.color(o,l,s,"hcl");case"interpolate-lab":return De.color(o,l,s,"lab")}}eachChild(t){t(this.input);for(const e of this.outputs)t(e);}outputDefined(){return this.outputs.every((t=>t.outputDefined()))}}function Ue(t,e,r,n){const i=n-r,a=t-r;return 0===i?0:1===e?a/i:(Math.pow(e,a)-1)/(Math.pow(e,i)-1)}class Re{constructor(t,e){this.type=t,this.args=e;}static parse(t,e){if(t.length<2)return e.error("Expectected at least one argument.");let r=null;const n=e.expectedType;n&&"value"!==n.kind&&(r=n);const i=[];for(const n of t.slice(1)){const t=e.parse(n,1+i.length,r,void 0,{typeAnnotation:"omit"});if(!t)return null;r=r||t.type,i.push(t);}if(!r)throw new Error("No output type");const a=n&&i.some((t=>vt(n,t.type)));return new Re(a?ct:r,i)}evaluate(t){let e,r=null,n=0;for(const i of this.args)if(n++,r=i.evaluate(t),r&&r instanceof Yt&&!r.available&&(e||(e=r.name),r=null,n===this.args.length&&(r=e)),null!==r)break;return r}eachChild(t){this.args.forEach(t);}outputDefined(){return this.args.every((t=>t.outputDefined()))}}class qe{constructor(t,e){this.type=e.type,this.bindings=[].concat(t),this.result=e;}evaluate(t){return this.result.evaluate(t)}eachChild(t){for(const e of this.bindings)t(e[1]);t(this.result);}static parse(t,e){if(t.length<4)return e.error(`Expected at least 3 arguments, but found ${t.length-1} instead.`);const r=[];for(let n=1;n<t.length-1;n+=2){const i=t[n];if("string"!=typeof i)return e.error(`Expected string, but found ${typeof i} instead.`,n);if(/[^a-zA-Z0-9_]/.test(i))return e.error("Variable names must contain only alphanumeric characters or '_'.",n);const a=e.parse(t[n+1],n+1);if(!a)return null;r.push([i,a]);}const n=e.parse(t[t.length-1],t.length-1,e.expectedType,r);return n?new qe(r,n):null}outputDefined(){return this.result.outputDefined()}}class je{constructor(t,e,r){this.type=t,this.index=e,this.input=r;}static parse(t,e){if(3!==t.length)return e.error(`Expected 2 arguments, but found ${t.length-1} instead.`);const r=e.parse(t[1],1,at),n=e.parse(t[2],2,mt(e.expectedType||ct));return r&&n?new je(n.type.itemType,r,n):null}evaluate(t){const e=this.index.evaluate(t),r=this.input.evaluate(t);if(e<0)throw new re(`Array index out of bounds: ${e} < 0.`);if(e>=r.length)throw new re(`Array index out of bounds: ${e} > ${r.length-1}.`);if(e!==Math.floor(e))throw new re(`Array index must be an integer, but found ${e} instead.`);return r[e]}eachChild(t){t(this.index),t(this.input);}outputDefined(){return !1}}class Ne{constructor(t,e){this.type=ot,this.needle=t,this.haystack=e;}static parse(t,e){if(3!==t.length)return e.error(`Expected 2 arguments, but found ${t.length-1} instead.`);const r=e.parse(t[1],1,ct),n=e.parse(t[2],2,ct);return r&&n?bt(r.type,[ot,st,at,it,ct])?new Ne(r,n):e.error(`Expected first argument to be of type boolean, string, number or null, but found ${gt(r.type)} instead`):null}evaluate(t){const e=this.needle.evaluate(t),r=this.haystack.evaluate(t);if(!r)return !1;if(!wt(e,["boolean","string","number","null"]))throw new re(`Expected first argument to be of type boolean, string, number or null, but found ${gt(Qt(e))} instead.`);if(!wt(r,["string","array"]))throw new re(`Expected second argument to be of type array or string, but found ${gt(Qt(r))} instead.`);return r.indexOf(e)>=0}eachChild(t){t(this.needle),t(this.haystack);}outputDefined(){return !0}}class Ze{constructor(t,e,r){this.type=at,this.needle=t,this.haystack=e,this.fromIndex=r;}static parse(t,e){if(t.length<=2||t.length>=5)return e.error(`Expected 3 or 4 arguments, but found ${t.length-1} instead.`);const r=e.parse(t[1],1,ct),n=e.parse(t[2],2,ct);if(!r||!n)return null;if(!bt(r.type,[ot,st,at,it,ct]))return e.error(`Expected first argument to be of type boolean, string, number or null, but found ${gt(r.type)} instead`);if(4===t.length){const i=e.parse(t[3],3,at);return i?new Ze(r,n,i):null}return new Ze(r,n)}evaluate(t){const e=this.needle.evaluate(t),r=this.haystack.evaluate(t);if(!wt(e,["boolean","string","number","null"]))throw new re(`Expected first argument to be of type boolean, string, number or null, but found ${gt(Qt(e))} instead.`);if(!wt(r,["string","array"]))throw new re(`Expected second argument to be of type array or string, but found ${gt(Qt(r))} instead.`);if(this.fromIndex){const n=this.fromIndex.evaluate(t);return r.indexOf(e,n)}return r.indexOf(e)}eachChild(t){t(this.needle),t(this.haystack),this.fromIndex&&t(this.fromIndex);}outputDefined(){return !1}}class Ke{constructor(t,e,r,n,i,a){this.inputType=t,this.type=e,this.input=r,this.cases=n,this.outputs=i,this.otherwise=a;}static parse(t,e){if(t.length<5)return e.error(`Expected at least 4 arguments, but found only ${t.length-1}.`);if(t.length%2!=1)return e.error("Expected an even number of arguments.");let r,n;e.expectedType&&"value"!==e.expectedType.kind&&(n=e.expectedType);const i={},a=[];for(let s=2;s<t.length-1;s+=2){let o=t[s];const l=t[s+1];Array.isArray(o)||(o=[o]);const u=e.concat(s);if(0===o.length)return u.error("Expected at least one branch label.");for(const t of o){if("number"!=typeof t&&"string"!=typeof t)return u.error("Branch labels must be numbers or strings.");if("number"==typeof t&&Math.abs(t)>Number.MAX_SAFE_INTEGER)return u.error(`Branch labels must be integers no larger than ${Number.MAX_SAFE_INTEGER}.`);if("number"==typeof t&&Math.floor(t)!==t)return u.error("Numeric branch labels must be integer values.");if(r){if(u.checkSubtype(r,Qt(t)))return null}else r=Qt(t);if(void 0!==i[String(t)])return u.error("Branch labels must be unique.");i[String(t)]=a.length;}const c=e.parse(l,s,n);if(!c)return null;n=n||c.type,a.push(c);}const s=e.parse(t[1],1,ct);if(!s)return null;const o=e.parse(t[t.length-1],t.length-1,n);return o?"value"!==s.type.kind&&e.concat(1).checkSubtype(r,s.type)?null:new Ke(r,n,s,i,a,o):null}evaluate(t){const e=this.input.evaluate(t);return (Qt(e)===this.inputType&&this.outputs[this.cases[e]]||this.otherwise).evaluate(t)}eachChild(t){t(this.input),this.outputs.forEach(t),t(this.otherwise);}outputDefined(){return this.outputs.every((t=>t.outputDefined()))&&this.otherwise.outputDefined()}}class Ge{constructor(t,e,r){this.type=t,this.branches=e,this.otherwise=r;}static parse(t,e){if(t.length<4)return e.error(`Expected at least 3 arguments, but found only ${t.length-1}.`);if(t.length%2!=0)return e.error("Expected an odd number of arguments.");let r;e.expectedType&&"value"!==e.expectedType.kind&&(r=e.expectedType);const n=[];for(let i=1;i<t.length-1;i+=2){const a=e.parse(t[i],i,ot);if(!a)return null;const s=e.parse(t[i+1],i+1,r);if(!s)return null;n.push([a,s]),r=r||s.type;}const i=e.parse(t[t.length-1],t.length-1,r);if(!i)return null;if(!r)throw new Error("Can't infer output type");return new Ge(r,n,i)}evaluate(t){for(const[e,r]of this.branches)if(e.evaluate(t))return r.evaluate(t);return this.otherwise.evaluate(t)}eachChild(t){for(const[e,r]of this.branches)t(e),t(r);t(this.otherwise);}outputDefined(){return this.branches.every((([t,e])=>e.outputDefined()))&&this.otherwise.outputDefined()}}class Je{constructor(t,e,r,n){this.type=t,this.input=e,this.beginIndex=r,this.endIndex=n;}static parse(t,e){if(t.length<=2||t.length>=5)return e.error(`Expected 3 or 4 arguments, but found ${t.length-1} instead.`);const r=e.parse(t[1],1,ct),n=e.parse(t[2],2,at);if(!r||!n)return null;if(!bt(r.type,[mt(ct),st,ct]))return e.error(`Expected first argument to be of type array or string, but found ${gt(r.type)} instead`);if(4===t.length){const i=e.parse(t[3],3,at);return i?new Je(r.type,r,n,i):null}return new Je(r.type,r,n)}evaluate(t){const e=this.input.evaluate(t),r=this.beginIndex.evaluate(t);if(!wt(e,["string","array"]))throw new re(`Expected first argument to be of type array or string, but found ${gt(Qt(e))} instead.`);if(this.endIndex){const n=this.endIndex.evaluate(t);return e.slice(r,n)}return e.slice(r)}eachChild(t){t(this.input),t(this.beginIndex),this.endIndex&&t(this.endIndex);}outputDefined(){return !1}}function Xe(t,e){return "=="===t||"!="===t?"boolean"===e.kind||"string"===e.kind||"number"===e.kind||"null"===e.kind||"value"===e.kind:"string"===e.kind||"number"===e.kind||"value"===e.kind}function Ye(t,e,r,n){return 0===n.compare(e,r)}function He(t,e,r){const n="=="!==t&&"!="!==t;return class i{constructor(t,e,r){this.type=ot,this.lhs=t,this.rhs=e,this.collator=r,this.hasUntypedArgument="value"===t.type.kind||"value"===e.type.kind;}static parse(t,e){if(3!==t.length&&4!==t.length)return e.error("Expected two or three arguments.");const r=t[0];let a=e.parse(t[1],1,ct);if(!a)return null;if(!Xe(r,a.type))return e.concat(1).error(`"${r}" comparisons are not supported for type '${gt(a.type)}'.`);let s=e.parse(t[2],2,ct);if(!s)return null;if(!Xe(r,s.type))return e.concat(2).error(`"${r}" comparisons are not supported for type '${gt(s.type)}'.`);if(a.type.kind!==s.type.kind&&"value"!==a.type.kind&&"value"!==s.type.kind)return e.error(`Cannot compare types '${gt(a.type)}' and '${gt(s.type)}'.`);n&&("value"===a.type.kind&&"value"!==s.type.kind?a=new ie(s.type,[a]):"value"!==a.type.kind&&"value"===s.type.kind&&(s=new ie(a.type,[s])));let o=null;if(4===t.length){if("string"!==a.type.kind&&"string"!==s.type.kind&&"value"!==a.type.kind&&"value"!==s.type.kind)return e.error("Cannot use collator to compare non-string types.");if(o=e.parse(t[3],3,ht),!o)return null}return new i(a,s,o)}evaluate(i){const a=this.lhs.evaluate(i),s=this.rhs.evaluate(i);if(n&&this.hasUntypedArgument){const e=Qt(a),r=Qt(s);if(e.kind!==r.kind||"string"!==e.kind&&"number"!==e.kind)throw new re(`Expected arguments for "${t}" to be (string, string) or (number, number), but found (${e.kind}, ${r.kind}) instead.`)}if(this.collator&&!n&&this.hasUntypedArgument){const t=Qt(a),r=Qt(s);if("string"!==t.kind||"string"!==r.kind)return e(i,a,s)}return this.collator?r(i,a,s,this.collator.evaluate(i)):e(i,a,s)}eachChild(t){t(this.lhs),t(this.rhs),this.collator&&t(this.collator);}outputDefined(){return !0}}}const We=He("==",(function(t,e,r){return e===r}),Ye),Qe=He("!=",(function(t,e,r){return e!==r}),(function(t,e,r,n){return !Ye(0,e,r,n)})),tr=He("<",(function(t,e,r){return e<r}),(function(t,e,r,n){return n.compare(e,r)<0})),er=He(">",(function(t,e,r){return e>r}),(function(t,e,r,n){return n.compare(e,r)>0})),rr=He("<=",(function(t,e,r){return e<=r}),(function(t,e,r,n){return n.compare(e,r)<=0})),nr=He(">=",(function(t,e,r){return e>=r}),(function(t,e,r,n){return n.compare(e,r)>=0}));class ir{constructor(t,e,r,n,i){this.type=st,this.number=t,this.locale=e,this.currency=r,this.minFractionDigits=n,this.maxFractionDigits=i;}static parse(t,e){if(3!==t.length)return e.error("Expected two arguments.");const r=e.parse(t[1],1,at);if(!r)return null;const n=t[2];if("object"!=typeof n||Array.isArray(n))return e.error("NumberFormat options argument must be an object.");let i=null;if(n.locale&&(i=e.parse(n.locale,1,st),!i))return null;let a=null;if(n.currency&&(a=e.parse(n.currency,1,st),!a))return null;let s=null;if(n["min-fraction-digits"]&&(s=e.parse(n["min-fraction-digits"],1,at),!s))return null;let o=null;return n["max-fraction-digits"]&&(o=e.parse(n["max-fraction-digits"],1,at),!o)?null:new ir(r,i,a,s,o)}evaluate(t){return new Intl.NumberFormat(this.locale?this.locale.evaluate(t):[],{style:this.currency?"currency":"decimal",currency:this.currency?this.currency.evaluate(t):void 0,minimumFractionDigits:this.minFractionDigits?this.minFractionDigits.evaluate(t):void 0,maximumFractionDigits:this.maxFractionDigits?this.maxFractionDigits.evaluate(t):void 0}).format(this.number.evaluate(t))}eachChild(t){t(this.number),this.locale&&t(this.locale),this.currency&&t(this.currency),this.minFractionDigits&&t(this.minFractionDigits),this.maxFractionDigits&&t(this.maxFractionDigits);}outputDefined(){return !1}}class ar{constructor(t){this.type=pt,this.sections=t;}static parse(t,e){if(t.length<2)return e.error("Expected at least one argument.");const r=t[1];if(!Array.isArray(r)&&"object"==typeof r)return e.error("First argument must be an image or text section.");const n=[];let i=!1;for(let r=1;r<=t.length-1;++r){const a=t[r];if(i&&"object"==typeof a&&!Array.isArray(a)){i=!1;let t=null;if(a["font-scale"]&&(t=e.parse(a["font-scale"],1,at),!t))return null;let r=null;if(a["text-font"]&&(r=e.parse(a["text-font"],1,mt(st)),!r))return null;let s=null;if(a["text-color"]&&(s=e.parse(a["text-color"],1,lt),!s))return null;const o=n[n.length-1];o.scale=t,o.font=r,o.textColor=s;}else {const a=e.parse(t[r],1,ct);if(!a)return null;const s=a.type.kind;if("string"!==s&&"value"!==s&&"null"!==s&&"resolvedImage"!==s)return e.error("Formatted text type must be 'string', 'value', 'image' or 'null'.");i=!0,n.push({content:a,scale:null,font:null,textColor:null});}}return new ar(n)}evaluate(t){return new Kt(this.sections.map((e=>{const r=e.content.evaluate(t);return Qt(r)===dt?new Zt("",r,null,null,null):new Zt(te(r),null,e.scale?e.scale.evaluate(t):null,e.font?e.font.evaluate(t).join(","):null,e.textColor?e.textColor.evaluate(t):null)})))}eachChild(t){for(const e of this.sections)t(e.content),e.scale&&t(e.scale),e.font&&t(e.font),e.textColor&&t(e.textColor);}outputDefined(){return !1}}class sr{constructor(t){this.type=dt,this.input=t;}static parse(t,e){if(2!==t.length)return e.error("Expected two arguments.");const r=e.parse(t[1],1,st);return r?new sr(r):e.error("No image name provided.")}evaluate(t){const e=this.input.evaluate(t),r=Yt.fromString(e);return r&&t.availableImages&&(r.available=t.availableImages.indexOf(e)>-1),r}eachChild(t){t(this.input);}outputDefined(){return !1}}class or{constructor(t){this.type=at,this.input=t;}static parse(t,e){if(2!==t.length)return e.error(`Expected 1 argument, but found ${t.length-1} instead.`);const r=e.parse(t[1],1);return r?"array"!==r.type.kind&&"string"!==r.type.kind&&"value"!==r.type.kind?e.error(`Expected argument of type string or array, but found ${gt(r.type)} instead.`):new or(r):null}evaluate(t){const e=this.input.evaluate(t);if("string"==typeof e)return e.length;if(Array.isArray(e))return e.length;throw new re(`Expected value to be of type string or array, but found ${gt(Qt(e))} instead.`)}eachChild(t){t(this.input);}outputDefined(){return !1}}const lr={"==":We,"!=":Qe,">":er,"<":tr,">=":nr,"<=":rr,array:ie,at:je,boolean:ie,case:Ge,coalesce:Re,collator:ce,format:ar,image:sr,in:Ne,"index-of":Ze,interpolate:Oe,"interpolate-hcl":Oe,"interpolate-lab":Oe,length:or,let:qe,literal:ee,match:Ke,number:ie,"number-format":ir,object:ie,slice:Je,step:Fe,string:ie,"to-boolean":se,"to-color":se,"to-number":se,"to-string":se,var:Me,within:ze};function ur(t,[e,r,n,i]){e=e.evaluate(t),r=r.evaluate(t),n=n.evaluate(t);const a=i?i.evaluate(t):1,s=Ht(e,r,n,a);if(s)throw new re(s);return new jt(e/255,r/255,n/255,a,!1)}function cr(t,e){return t in e}function hr(t,e){const r=e[t];return void 0===r?null:r}function pr(t){return {type:t}}function fr(t){return {result:"success",value:t}}function dr(t){return {result:"error",value:t}}function yr(t){return "data-driven"===t["property-type"]||"cross-faded-data-driven"===t["property-type"]}function mr(t){return !!t.expression&&t.expression.parameters.indexOf("zoom")>-1}function gr(t){return !!t.expression&&t.expression.interpolated}function xr(t){return t instanceof Number?"number":t instanceof String?"string":t instanceof Boolean?"boolean":Array.isArray(t)?"array":null===t?"null":typeof t}function vr(t){return "object"==typeof t&&null!==t&&!Array.isArray(t)}function br(t){return t}function wr(t,e){const r="color"===e.type,n=t.stops&&"object"==typeof t.stops[0][0],i=n||!(n||void 0!==t.property),a=t.type||(gr(e)?"exponential":"interval");if(r||"padding"===e.type){const n=r?jt.parse:Gt.parse;(t=et({},t)).stops&&(t.stops=t.stops.map((t=>[t[0],n(t[1])]))),t.default=n(t.default?t.default:e.default);}if(t.colorSpace&&"rgb"!==(s=t.colorSpace)&&"hcl"!==s&&"lab"!==s)throw new Error(`Unknown color space: "${t.colorSpace}"`);var s;let o,l,u;if("exponential"===a)o=kr;else if("interval"===a)o=Sr;else if("categorical"===a){o=Ar,l=Object.create(null);for(const e of t.stops)l[e[0]]=e[1];u=typeof t.stops[0][0];}else {if("identity"!==a)throw new Error(`Unknown function type "${a}"`);o=Ir;}if(n){const r={},n=[];for(let e=0;e<t.stops.length;e++){const i=t.stops[e],a=i[0].zoom;void 0===r[a]&&(r[a]={zoom:a,type:t.type,property:t.property,default:t.default,stops:[]},n.push(a)),r[a].stops.push([i[0].value,i[1]]);}const i=[];for(const t of n)i.push([r[t].zoom,wr(r[t],e)]);const a={name:"linear"};return {kind:"composite",interpolationType:a,interpolationFactor:Oe.interpolationFactor.bind(void 0,a),zoomStops:i.map((t=>t[0])),evaluate:({zoom:r},n)=>kr({stops:i,base:t.base},e,r).evaluate(r,n)}}if(i){const r="exponential"===a?{name:"exponential",base:void 0!==t.base?t.base:1}:null;return {kind:"camera",interpolationType:r,interpolationFactor:Oe.interpolationFactor.bind(void 0,r),zoomStops:t.stops.map((t=>t[0])),evaluate:({zoom:r})=>o(t,e,r,l,u)}}return {kind:"source",evaluate(r,n){const i=n&&n.properties?n.properties[t.property]:void 0;return void 0===i?_r(t.default,e.default):o(t,e,i,l,u)}}}function _r(t,e,r){return void 0!==t?t:void 0!==e?e:void 0!==r?r:void 0}function Ar(t,e,r,n,i){return _r(typeof r===i?n[r]:void 0,t.default,e.default)}function Sr(t,e,r){if("number"!==xr(r))return _r(t.default,e.default);const n=t.stops.length;if(1===n)return t.stops[0][1];if(r<=t.stops[0][0])return t.stops[0][1];if(r>=t.stops[n-1][0])return t.stops[n-1][1];const i=Te(t.stops.map((t=>t[0])),r);return t.stops[i][1]}function kr(t,e,r){const n=void 0!==t.base?t.base:1;if("number"!==xr(r))return _r(t.default,e.default);const i=t.stops.length;if(1===i)return t.stops[0][1];if(r<=t.stops[0][0])return t.stops[0][1];if(r>=t.stops[i-1][0])return t.stops[i-1][1];const a=Te(t.stops.map((t=>t[0])),r),s=function(t,e,r,n){const i=n-r,a=t-r;return 0===i?0:1===e?a/i:(Math.pow(e,a)-1)/(Math.pow(e,i)-1)}(r,n,t.stops[a][0],t.stops[a+1][0]),o=t.stops[a][1],l=t.stops[a+1][1],u=De[e.type]||br;return "function"==typeof o.evaluate?{evaluate(...e){const r=o.evaluate.apply(void 0,e),n=l.evaluate.apply(void 0,e);if(void 0!==r&&void 0!==n)return u(r,n,s,t.colorSpace)}}:u(o,l,s,t.colorSpace)}function Ir(t,e,r){switch(e.type){case"color":r=jt.parse(r);break;case"formatted":r=Kt.fromString(r.toString());break;case"resolvedImage":r=Yt.fromString(r.toString());break;case"padding":r=Gt.parse(r);break;default:xr(r)===e.type||"enum"===e.type&&e.values[r]||(r=void 0);}return _r(r,t.default,e.default)}Pe.register(lr,{error:[{kind:"error"},[st],(t,[e])=>{throw new re(e.evaluate(t))}],typeof:[st,[ct],(t,[e])=>gt(Qt(e.evaluate(t)))],"to-rgba":[mt(at,4),[lt],(t,[e])=>{const[r,n,i,a]=e.evaluate(t).rgb;return [255*r,255*n,255*i,a]}],rgb:[lt,[at,at,at],ur],rgba:[lt,[at,at,at,at],ur],has:{type:ot,overloads:[[[st],(t,[e])=>cr(e.evaluate(t),t.properties())],[[st,ut],(t,[e,r])=>cr(e.evaluate(t),r.evaluate(t))]]},get:{type:ct,overloads:[[[st],(t,[e])=>hr(e.evaluate(t),t.properties())],[[st,ut],(t,[e,r])=>hr(e.evaluate(t),r.evaluate(t))]]},"feature-state":[ct,[st],(t,[e])=>hr(e.evaluate(t),t.featureState||{})],properties:[ut,[],t=>t.properties()],"geometry-type":[st,[],t=>t.geometryType()],id:[ct,[],t=>t.id()],zoom:[at,[],t=>t.globals.zoom],"heatmap-density":[at,[],t=>t.globals.heatmapDensity||0],"line-progress":[at,[],t=>t.globals.lineProgress||0],accumulated:[ct,[],t=>void 0===t.globals.accumulated?null:t.globals.accumulated],"+":[at,pr(at),(t,e)=>{let r=0;for(const n of e)r+=n.evaluate(t);return r}],"*":[at,pr(at),(t,e)=>{let r=1;for(const n of e)r*=n.evaluate(t);return r}],"-":{type:at,overloads:[[[at,at],(t,[e,r])=>e.evaluate(t)-r.evaluate(t)],[[at],(t,[e])=>-e.evaluate(t)]]},"/":[at,[at,at],(t,[e,r])=>e.evaluate(t)/r.evaluate(t)],"%":[at,[at,at],(t,[e,r])=>e.evaluate(t)%r.evaluate(t)],ln2:[at,[],()=>Math.LN2],pi:[at,[],()=>Math.PI],e:[at,[],()=>Math.E],"^":[at,[at,at],(t,[e,r])=>Math.pow(e.evaluate(t),r.evaluate(t))],sqrt:[at,[at],(t,[e])=>Math.sqrt(e.evaluate(t))],log10:[at,[at],(t,[e])=>Math.log(e.evaluate(t))/Math.LN10],ln:[at,[at],(t,[e])=>Math.log(e.evaluate(t))],log2:[at,[at],(t,[e])=>Math.log(e.evaluate(t))/Math.LN2],sin:[at,[at],(t,[e])=>Math.sin(e.evaluate(t))],cos:[at,[at],(t,[e])=>Math.cos(e.evaluate(t))],tan:[at,[at],(t,[e])=>Math.tan(e.evaluate(t))],asin:[at,[at],(t,[e])=>Math.asin(e.evaluate(t))],acos:[at,[at],(t,[e])=>Math.acos(e.evaluate(t))],atan:[at,[at],(t,[e])=>Math.atan(e.evaluate(t))],min:[at,pr(at),(t,e)=>Math.min(...e.map((e=>e.evaluate(t))))],max:[at,pr(at),(t,e)=>Math.max(...e.map((e=>e.evaluate(t))))],abs:[at,[at],(t,[e])=>Math.abs(e.evaluate(t))],round:[at,[at],(t,[e])=>{const r=e.evaluate(t);return r<0?-Math.round(-r):Math.round(r)}],floor:[at,[at],(t,[e])=>Math.floor(e.evaluate(t))],ceil:[at,[at],(t,[e])=>Math.ceil(e.evaluate(t))],"filter-==":[ot,[st,ct],(t,[e,r])=>t.properties()[e.value]===r.value],"filter-id-==":[ot,[ct],(t,[e])=>t.id()===e.value],"filter-type-==":[ot,[st],(t,[e])=>t.geometryType()===e.value],"filter-<":[ot,[st,ct],(t,[e,r])=>{const n=t.properties()[e.value],i=r.value;return typeof n==typeof i&&n<i}],"filter-id-<":[ot,[ct],(t,[e])=>{const r=t.id(),n=e.value;return typeof r==typeof n&&r<n}],"filter->":[ot,[st,ct],(t,[e,r])=>{const n=t.properties()[e.value],i=r.value;return typeof n==typeof i&&n>i}],"filter-id->":[ot,[ct],(t,[e])=>{const r=t.id(),n=e.value;return typeof r==typeof n&&r>n}],"filter-<=":[ot,[st,ct],(t,[e,r])=>{const n=t.properties()[e.value],i=r.value;return typeof n==typeof i&&n<=i}],"filter-id-<=":[ot,[ct],(t,[e])=>{const r=t.id(),n=e.value;return typeof r==typeof n&&r<=n}],"filter->=":[ot,[st,ct],(t,[e,r])=>{const n=t.properties()[e.value],i=r.value;return typeof n==typeof i&&n>=i}],"filter-id->=":[ot,[ct],(t,[e])=>{const r=t.id(),n=e.value;return typeof r==typeof n&&r>=n}],"filter-has":[ot,[ct],(t,[e])=>e.value in t.properties()],"filter-has-id":[ot,[],t=>null!==t.id()&&void 0!==t.id()],"filter-type-in":[ot,[mt(st)],(t,[e])=>e.value.indexOf(t.geometryType())>=0],"filter-id-in":[ot,[mt(ct)],(t,[e])=>e.value.indexOf(t.id())>=0],"filter-in-small":[ot,[st,mt(ct)],(t,[e,r])=>r.value.indexOf(t.properties()[e.value])>=0],"filter-in-large":[ot,[st,mt(ct)],(t,[e,r])=>function(t,e,r,n){for(;r<=n;){const i=r+n>>1;if(e[i]===t)return !0;e[i]>t?n=i-1:r=i+1;}return !1}(t.properties()[e.value],r.value,0,r.value.length-1)],all:{type:ot,overloads:[[[ot,ot],(t,[e,r])=>e.evaluate(t)&&r.evaluate(t)],[pr(ot),(t,e)=>{for(const r of e)if(!r.evaluate(t))return !1;return !0}]]},any:{type:ot,overloads:[[[ot,ot],(t,[e,r])=>e.evaluate(t)||r.evaluate(t)],[pr(ot),(t,e)=>{for(const r of e)if(r.evaluate(t))return !0;return !1}]]},"!":[ot,[ot],(t,[e])=>!e.evaluate(t)],"is-supported-script":[ot,[st],(t,[e])=>{const r=t.globals&&t.globals.isSupportedScript;return !r||r(e.evaluate(t))}],upcase:[st,[st],(t,[e])=>e.evaluate(t).toUpperCase()],downcase:[st,[st],(t,[e])=>e.evaluate(t).toLowerCase()],concat:[st,pr(ct),(t,e)=>e.map((e=>te(e.evaluate(t)))).join("")],"resolved-locale":[st,[ht],(t,[e])=>e.evaluate(t).resolvedLocale()]});class zr{constructor(t,e){var r;this.expression=t,this._warningHistory={},this._evaluator=new le,this._defaultValue=e?"color"===(r=e).type&&vr(r.default)?new jt(0,0,0,0):"color"===r.type?jt.parse(r.default)||null:"padding"===r.type?Gt.parse(r.default)||null:"variableAnchorOffsetCollection"===r.type?Xt.parse(r.default)||null:void 0===r.default?null:r.default:null,this._enumValues=e&&"enum"===e.type?e.values:null;}evaluateWithoutErrorHandling(t,e,r,n,i,a){return this._evaluator.globals=t,this._evaluator.feature=e,this._evaluator.featureState=r,this._evaluator.canonical=n,this._evaluator.availableImages=i||null,this._evaluator.formattedSection=a,this.expression.evaluate(this._evaluator)}evaluate(t,e,r,n,i,a){this._evaluator.globals=t,this._evaluator.feature=e||null,this._evaluator.featureState=r||null,this._evaluator.canonical=n,this._evaluator.availableImages=i||null,this._evaluator.formattedSection=a||null;try{const t=this.expression.evaluate(this._evaluator);if(null==t||"number"==typeof t&&t!=t)return this._defaultValue;if(this._enumValues&&!(t in this._enumValues))throw new re(`Expected value to be one of ${Object.keys(this._enumValues).map((t=>JSON.stringify(t))).join(", ")}, but found ${JSON.stringify(t)} instead.`);return t}catch(t){return this._warningHistory[t.message]||(this._warningHistory[t.message]=!0,"undefined"!=typeof console&&console.warn(t.message)),this._defaultValue}}}function Mr(t){return Array.isArray(t)&&t.length>0&&"string"==typeof t[0]&&t[0]in lr}function Pr(t,e){const r=new ue(lr,Be,[],e?function(t){const e={color:lt,string:st,number:at,enum:st,boolean:ot,formatted:pt,padding:ft,resolvedImage:dt,variableAnchorOffsetCollection:yt};return "array"===t.type?mt(e[t.value]||ct,t.length):e[t.type]}(e):void 0),n=r.parse(t,void 0,void 0,void 0,e&&"string"===e.type?{typeAnnotation:"coerce"}:void 0);return n?fr(new zr(n,e)):dr(r.errors)}class Br{constructor(t,e){this.kind=t,this._styleExpression=e,this.isStateDependent="constant"!==t&&!Ve(e.expression);}evaluateWithoutErrorHandling(t,e,r,n,i,a){return this._styleExpression.evaluateWithoutErrorHandling(t,e,r,n,i,a)}evaluate(t,e,r,n,i,a){return this._styleExpression.evaluate(t,e,r,n,i,a)}}class Cr{constructor(t,e,r,n){this.kind=t,this.zoomStops=r,this._styleExpression=e,this.isStateDependent="camera"!==t&&!Ve(e.expression),this.interpolationType=n;}evaluateWithoutErrorHandling(t,e,r,n,i,a){return this._styleExpression.evaluateWithoutErrorHandling(t,e,r,n,i,a)}evaluate(t,e,r,n,i,a){return this._styleExpression.evaluate(t,e,r,n,i,a)}interpolationFactor(t,e,r){return this.interpolationType?Oe.interpolationFactor(this.interpolationType,t,e,r):0}}function Vr(t,e){const r=Pr(t,e);if("error"===r.result)return r;const n=r.value.expression,i=Ce(n);if(!i&&!yr(e))return dr([new rt("","data expressions not supported")]);const a=Ee(n,["zoom"]);if(!a&&!mr(e))return dr([new rt("","zoom expressions not supported")]);const s=Tr(n);return s||a?s instanceof rt?dr([s]):s instanceof Oe&&!gr(e)?dr([new rt("",'"interpolate" expressions cannot be used with this property')]):fr(s?new Cr(i?"camera":"composite",r.value,s.labels,s instanceof Oe?s.interpolation:void 0):new Br(i?"constant":"source",r.value)):dr([new rt("",'"zoom" expression may only be used as input to a top-level "step" or "interpolate" expression.')])}class Er{constructor(t,e){this._parameters=t,this._specification=e,et(this,wr(this._parameters,this._specification));}static deserialize(t){return new Er(t._parameters,t._specification)}static serialize(t){return {_parameters:t._parameters,_specification:t._specification}}}function Tr(t){let e=null;if(t instanceof qe)e=Tr(t.result);else if(t instanceof Re){for(const r of t.args)if(e=Tr(r),e)break}else (t instanceof Fe||t instanceof Oe)&&t.input instanceof Pe&&"zoom"===t.input.name&&(e=t);return e instanceof rt||t.eachChild((t=>{const r=Tr(t);r instanceof rt?e=r:!e&&r?e=new rt("",'"zoom" expression may only be used as input to a top-level "step" or "interpolate" expression.'):e&&r&&e!==r&&(e=new rt("",'Only one zoom-based "step" or "interpolate" subexpression may be used in an expression.'));})),e}function Fr(t){if(!0===t||!1===t)return !0;if(!Array.isArray(t)||0===t.length)return !1;switch(t[0]){case"has":return t.length>=2&&"$id"!==t[1]&&"$type"!==t[1];case"in":return t.length>=3&&("string"!=typeof t[1]||Array.isArray(t[2]));case"!in":case"!has":case"none":return !1;case"==":case"!=":case">":case">=":case"<":case"<=":return 3!==t.length||Array.isArray(t[1])||Array.isArray(t[2]);case"any":case"all":for(const e of t.slice(1))if(!Fr(e)&&"boolean"!=typeof e)return !1;return !0;default:return !0}}const Lr={type:"boolean",default:!1,transition:!1,"property-type":"data-driven",expression:{interpolated:!1,parameters:["zoom","feature"]}};function $r(t){if(null==t)return {filter:()=>!0,needGeometry:!1};Fr(t)||(t=Ur(t));const e=Pr(t,Lr);if("error"===e.result)throw new Error(e.value.map((t=>`${t.key}: ${t.message}`)).join(", "));return {filter:(t,r,n)=>e.value.evaluate(t,r,{},n),needGeometry:Or(t)}}function Dr(t,e){return t<e?-1:t>e?1:0}function Or(t){if(!Array.isArray(t))return !1;if("within"===t[0])return !0;for(let e=1;e<t.length;e++)if(Or(t[e]))return !0;return !1}function Ur(t){if(!t)return !0;const e=t[0];return t.length<=1?"any"!==e:"=="===e?Rr(t[1],t[2],"=="):"!="===e?Nr(Rr(t[1],t[2],"==")):"<"===e||">"===e||"<="===e||">="===e?Rr(t[1],t[2],e):"any"===e?(r=t.slice(1),["any"].concat(r.map(Ur))):"all"===e?["all"].concat(t.slice(1).map(Ur)):"none"===e?["all"].concat(t.slice(1).map(Ur).map(Nr)):"in"===e?qr(t[1],t.slice(2)):"!in"===e?Nr(qr(t[1],t.slice(2))):"has"===e?jr(t[1]):"!has"===e?Nr(jr(t[1])):"within"!==e||t;var r;}function Rr(t,e,r){switch(t){case"$type":return [`filter-type-${r}`,e];case"$id":return [`filter-id-${r}`,e];default:return [`filter-${r}`,t,e]}}function qr(t,e){if(0===e.length)return !1;switch(t){case"$type":return ["filter-type-in",["literal",e]];case"$id":return ["filter-id-in",["literal",e]];default:return e.length>200&&!e.some((t=>typeof t!=typeof e[0]))?["filter-in-large",t,["literal",e.sort(Dr)]]:["filter-in-small",t,["literal",e]]}}function jr(t){switch(t){case"$type":return !0;case"$id":return ["filter-has-id"];default:return ["filter-has",t]}}function Nr(t){return ["!",t]}function Zr(t){const e=typeof t;if("number"===e||"boolean"===e||"string"===e||null==t)return JSON.stringify(t);if(Array.isArray(t)){let e="[";for(const r of t)e+=`${Zr(r)},`;return `${e}]`}const r=Object.keys(t).sort();let n="{";for(let e=0;e<r.length;e++)n+=`${JSON.stringify(r[e])}:${Zr(t[r[e]])},`;return `${n}}`}function Kr(t){let e="";for(const r of j)e+=`/${Zr(t[r])}`;return e}function Gr(t){const e=t.value;return e?[new tt(t.key,e,"constants have been deprecated as of v8")]:[]}function Jr(t){return t instanceof Number||t instanceof String||t instanceof Boolean?t.valueOf():t}function Xr(t){if(Array.isArray(t))return t.map(Xr);if(t instanceof Object&&!(t instanceof Number||t instanceof String||t instanceof Boolean)){const e={};for(const r in t)e[r]=Xr(t[r]);return e}return Jr(t)}function Yr(t){const e=t.key,r=t.value,n=t.valueSpec||{},i=t.objectElementValidators||{},a=t.style,s=t.styleSpec,o=t.validateSpec;let l=[];const u=xr(r);if("object"!==u)return [new tt(e,r,`object expected, ${u} found`)];for(const t in r){const u=t.split(".")[0],c=n[u]||n["*"];let h;if(i[u])h=i[u];else if(n[u])h=o;else if(i["*"])h=i["*"];else {if(!n["*"]){l.push(new tt(e,r[t],`unknown property "${t}"`));continue}h=o;}l=l.concat(h({key:(e?`${e}.`:e)+t,value:r[t],valueSpec:c,style:a,styleSpec:s,object:r,objectKey:t,validateSpec:o},r));}for(const t in n)i[t]||n[t].required&&void 0===n[t].default&&void 0===r[t]&&l.push(new tt(e,r,`missing required property "${t}"`));return l}function Hr(t){const e=t.value,r=t.valueSpec,n=t.style,i=t.styleSpec,a=t.key,s=t.arrayElementValidator||t.validateSpec;if("array"!==xr(e))return [new tt(a,e,`array expected, ${xr(e)} found`)];if(r.length&&e.length!==r.length)return [new tt(a,e,`array length ${r.length} expected, length ${e.length} found`)];if(r["min-length"]&&e.length<r["min-length"])return [new tt(a,e,`array length at least ${r["min-length"]} expected, length ${e.length} found`)];let o={type:r.value,values:r.values};i.$version<7&&(o.function=r.function),"object"===xr(r.value)&&(o=r.value);let l=[];for(let r=0;r<e.length;r++)l=l.concat(s({array:e,arrayIndex:r,value:e[r],valueSpec:o,validateSpec:t.validateSpec,style:n,styleSpec:i,key:`${a}[${r}]`}));return l}function Wr(t){const e=t.key,r=t.value,n=t.valueSpec;let i=xr(r);return "number"===i&&r!=r&&(i="NaN"),"number"!==i?[new tt(e,r,`number expected, ${i} found`)]:"minimum"in n&&r<n.minimum?[new tt(e,r,`${r} is less than the minimum value ${n.minimum}`)]:"maximum"in n&&r>n.maximum?[new tt(e,r,`${r} is greater than the maximum value ${n.maximum}`)]:[]}function Qr(t){const e=t.valueSpec,r=Jr(t.value.type);let n,i,a,s={};const o="categorical"!==r&&void 0===t.value.property,l=!o,u="array"===xr(t.value.stops)&&"array"===xr(t.value.stops[0])&&"object"===xr(t.value.stops[0][0]),c=Yr({key:t.key,value:t.value,valueSpec:t.styleSpec.function,validateSpec:t.validateSpec,style:t.style,styleSpec:t.styleSpec,objectElementValidators:{stops:function(t){if("identity"===r)return [new tt(t.key,t.value,'identity function may not have a "stops" property')];let e=[];const n=t.value;return e=e.concat(Hr({key:t.key,value:n,valueSpec:t.valueSpec,validateSpec:t.validateSpec,style:t.style,styleSpec:t.styleSpec,arrayElementValidator:h})),"array"===xr(n)&&0===n.length&&e.push(new tt(t.key,n,"array must have at least one stop")),e},default:function(t){return t.validateSpec({key:t.key,value:t.value,valueSpec:e,validateSpec:t.validateSpec,style:t.style,styleSpec:t.styleSpec})}}});return "identity"===r&&o&&c.push(new tt(t.key,t.value,'missing required property "property"')),"identity"===r||t.value.stops||c.push(new tt(t.key,t.value,'missing required property "stops"')),"exponential"===r&&t.valueSpec.expression&&!gr(t.valueSpec)&&c.push(new tt(t.key,t.value,"exponential functions not supported")),t.styleSpec.$version>=8&&(l&&!yr(t.valueSpec)?c.push(new tt(t.key,t.value,"property functions not supported")):o&&!mr(t.valueSpec)&&c.push(new tt(t.key,t.value,"zoom functions not supported"))),"categorical"!==r&&!u||void 0!==t.value.property||c.push(new tt(t.key,t.value,'"property" property is required')),c;function h(t){let r=[];const n=t.value,o=t.key;if("array"!==xr(n))return [new tt(o,n,`array expected, ${xr(n)} found`)];if(2!==n.length)return [new tt(o,n,`array length 2 expected, length ${n.length} found`)];if(u){if("object"!==xr(n[0]))return [new tt(o,n,`object expected, ${xr(n[0])} found`)];if(void 0===n[0].zoom)return [new tt(o,n,"object stop key must have zoom")];if(void 0===n[0].value)return [new tt(o,n,"object stop key must have value")];if(a&&a>Jr(n[0].zoom))return [new tt(o,n[0].zoom,"stop zoom values must appear in ascending order")];Jr(n[0].zoom)!==a&&(a=Jr(n[0].zoom),i=void 0,s={}),r=r.concat(Yr({key:`${o}[0]`,value:n[0],valueSpec:{zoom:{}},validateSpec:t.validateSpec,style:t.style,styleSpec:t.styleSpec,objectElementValidators:{zoom:Wr,value:p}}));}else r=r.concat(p({key:`${o}[0]`,value:n[0],valueSpec:{},validateSpec:t.validateSpec,style:t.style,styleSpec:t.styleSpec},n));return Mr(Xr(n[1]))?r.concat([new tt(`${o}[1]`,n[1],"expressions are not allowed in function stops.")]):r.concat(t.validateSpec({key:`${o}[1]`,value:n[1],valueSpec:e,validateSpec:t.validateSpec,style:t.style,styleSpec:t.styleSpec}))}function p(t,a){const o=xr(t.value),l=Jr(t.value),u=null!==t.value?t.value:a;if(n){if(o!==n)return [new tt(t.key,u,`${o} stop domain type must match previous stop domain type ${n}`)]}else n=o;if("number"!==o&&"string"!==o&&"boolean"!==o)return [new tt(t.key,u,"stop domain value must be a number, string, or boolean")];if("number"!==o&&"categorical"!==r){let n=`number expected, ${o} found`;return yr(e)&&void 0===r&&(n+='\nIf you intended to use a categorical function, specify `"type": "categorical"`.'),[new tt(t.key,u,n)]}return "categorical"!==r||"number"!==o||isFinite(l)&&Math.floor(l)===l?"categorical"!==r&&"number"===o&&void 0!==i&&l<i?[new tt(t.key,u,"stop domain values must appear in ascending order")]:(i=l,"categorical"===r&&l in s?[new tt(t.key,u,"stop domain values must be unique")]:(s[l]=!0,[])):[new tt(t.key,u,`integer expected, found ${l}`)]}}function tn(t){const e=("property"===t.expressionContext?Vr:Pr)(Xr(t.value),t.valueSpec);if("error"===e.result)return e.value.map((e=>new tt(`${t.key}${e.key}`,t.value,e.message)));const r=e.value.expression||e.value._styleExpression.expression;if("property"===t.expressionContext&&"text-font"===t.propertyKey&&!r.outputDefined())return [new tt(t.key,t.value,`Invalid data expression for "${t.propertyKey}". Output values must be contained as literals within the expression.`)];if("property"===t.expressionContext&&"layout"===t.propertyType&&!Ve(r))return [new tt(t.key,t.value,'"feature-state" data expressions are not supported with layout properties.')];if("filter"===t.expressionContext&&!Ve(r))return [new tt(t.key,t.value,'"feature-state" data expressions are not supported with filters.')];if(t.expressionContext&&0===t.expressionContext.indexOf("cluster")){if(!Ee(r,["zoom","feature-state"]))return [new tt(t.key,t.value,'"zoom" and "feature-state" expressions are not supported with cluster properties.')];if("cluster-initial"===t.expressionContext&&!Ce(r))return [new tt(t.key,t.value,"Feature data expressions are not supported with initial expression part of cluster properties.")]}return []}function en(t){const e=t.key,r=t.value,n=t.valueSpec,i=[];return Array.isArray(n.values)?-1===n.values.indexOf(Jr(r))&&i.push(new tt(e,r,`expected one of [${n.values.join(", ")}], ${JSON.stringify(r)} found`)):-1===Object.keys(n.values).indexOf(Jr(r))&&i.push(new tt(e,r,`expected one of [${Object.keys(n.values).join(", ")}], ${JSON.stringify(r)} found`)),i}function rn(t){return Fr(Xr(t.value))?tn(et({},t,{expressionContext:"filter",valueSpec:{value:"boolean"}})):nn(t)}function nn(t){const e=t.value,r=t.key;if("array"!==xr(e))return [new tt(r,e,`array expected, ${xr(e)} found`)];const n=t.styleSpec;let i,a=[];if(e.length<1)return [new tt(r,e,"filter array must have at least 1 element")];switch(a=a.concat(en({key:`${r}[0]`,value:e[0],valueSpec:n.filter_operator,style:t.style,styleSpec:t.styleSpec})),Jr(e[0])){case"<":case"<=":case">":case">=":e.length>=2&&"$type"===Jr(e[1])&&a.push(new tt(r,e,`"$type" cannot be use with operator "${e[0]}"`));case"==":case"!=":3!==e.length&&a.push(new tt(r,e,`filter array for operator "${e[0]}" must have 3 elements`));case"in":case"!in":e.length>=2&&(i=xr(e[1]),"string"!==i&&a.push(new tt(`${r}[1]`,e[1],`string expected, ${i} found`)));for(let s=2;s<e.length;s++)i=xr(e[s]),"$type"===Jr(e[1])?a=a.concat(en({key:`${r}[${s}]`,value:e[s],valueSpec:n.geometry_type,style:t.style,styleSpec:t.styleSpec})):"string"!==i&&"number"!==i&&"boolean"!==i&&a.push(new tt(`${r}[${s}]`,e[s],`string, number, or boolean expected, ${i} found`));break;case"any":case"all":case"none":for(let n=1;n<e.length;n++)a=a.concat(nn({key:`${r}[${n}]`,value:e[n],style:t.style,styleSpec:t.styleSpec}));break;case"has":case"!has":i=xr(e[1]),2!==e.length?a.push(new tt(r,e,`filter array for "${e[0]}" operator must have 2 elements`)):"string"!==i&&a.push(new tt(`${r}[1]`,e[1],`string expected, ${i} found`));break;case"within":i=xr(e[1]),2!==e.length?a.push(new tt(r,e,`filter array for "${e[0]}" operator must have 2 elements`)):"object"!==i&&a.push(new tt(`${r}[1]`,e[1],`object expected, ${i} found`));}return a}function an(t,e){const r=t.key,n=t.validateSpec,i=t.style,a=t.styleSpec,s=t.value,o=t.objectKey,l=a[`${e}_${t.layerType}`];if(!l)return [];const u=o.match(/^(.*)-transition$/);if("paint"===e&&u&&l[u[1]]&&l[u[1]].transition)return n({key:r,value:s,valueSpec:a.transition,style:i,styleSpec:a});const c=t.valueSpec||l[o];if(!c)return [new tt(r,s,`unknown property "${o}"`)];let h;if("string"===xr(s)&&yr(c)&&!c.tokens&&(h=/^{([^}]+)}$/.exec(s)))return [new tt(r,s,`"${o}" does not support interpolation syntax\nUse an identity property function instead: \`{ "type": "identity", "property": ${JSON.stringify(h[1])} }\`.`)];const p=[];return "symbol"===t.layerType&&("text-field"===o&&i&&!i.glyphs&&p.push(new tt(r,s,'use of "text-field" requires a style "glyphs" property')),"text-font"===o&&vr(Xr(s))&&"identity"===Jr(s.type)&&p.push(new tt(r,s,'"text-font" does not support identity functions'))),p.concat(n({key:t.key,value:s,valueSpec:c,style:i,styleSpec:a,expressionContext:"property",propertyType:e,propertyKey:o}))}function sn(t){return an(t,"paint")}function on(t){return an(t,"layout")}function ln(t){let e=[];const r=t.value,n=t.key,i=t.style,a=t.styleSpec;r.type||r.ref||e.push(new tt(n,r,'either "type" or "ref" is required'));let s=Jr(r.type);const o=Jr(r.ref);if(r.id){const a=Jr(r.id);for(let s=0;s<t.arrayIndex;s++){const t=i.layers[s];Jr(t.id)===a&&e.push(new tt(n,r.id,`duplicate layer id "${r.id}", previously used at line ${t.id.__line__}`));}}if("ref"in r){let t;["type","source","source-layer","filter","layout"].forEach((t=>{t in r&&e.push(new tt(n,r[t],`"${t}" is prohibited for ref layers`));})),i.layers.forEach((e=>{Jr(e.id)===o&&(t=e);})),t?t.ref?e.push(new tt(n,r.ref,"ref cannot reference another ref layer")):s=Jr(t.type):e.push(new tt(n,r.ref,`ref layer "${o}" not found`));}else if("background"!==s)if(r.source){const t=i.sources&&i.sources[r.source],a=t&&Jr(t.type);t?"vector"===a&&"raster"===s?e.push(new tt(n,r.source,`layer "${r.id}" requires a raster source`)):"raster"===a&&"raster"!==s?e.push(new tt(n,r.source,`layer "${r.id}" requires a vector source`)):"vector"!==a||r["source-layer"]?"raster-dem"===a&&"hillshade"!==s?e.push(new tt(n,r.source,"raster-dem source can only be used with layer type 'hillshade'.")):"line"!==s||!r.paint||!r.paint["line-gradient"]||"geojson"===a&&t.lineMetrics||e.push(new tt(n,r,`layer "${r.id}" specifies a line-gradient, which requires a GeoJSON source with \`lineMetrics\` enabled.`)):e.push(new tt(n,r,`layer "${r.id}" must specify a "source-layer"`)):e.push(new tt(n,r.source,`source "${r.source}" not found`));}else e.push(new tt(n,r,'missing required property "source"'));return e=e.concat(Yr({key:n,value:r,valueSpec:a.layer,style:t.style,styleSpec:t.styleSpec,validateSpec:t.validateSpec,objectElementValidators:{"*":()=>[],type:()=>t.validateSpec({key:`${n}.type`,value:r.type,valueSpec:a.layer.type,style:t.style,styleSpec:t.styleSpec,validateSpec:t.validateSpec,object:r,objectKey:"type"}),filter:rn,layout:t=>Yr({layer:r,key:t.key,value:t.value,style:t.style,styleSpec:t.styleSpec,validateSpec:t.validateSpec,objectElementValidators:{"*":t=>on(et({layerType:s},t))}}),paint:t=>Yr({layer:r,key:t.key,value:t.value,style:t.style,styleSpec:t.styleSpec,validateSpec:t.validateSpec,objectElementValidators:{"*":t=>sn(et({layerType:s},t))}})}})),e}function un(t){const e=t.value,r=t.key,n=xr(e);return "string"!==n?[new tt(r,e,`string expected, ${n} found`)]:[]}const cn={promoteId:function({key:t,value:e}){if("string"===xr(e))return un({key:t,value:e});{const r=[];for(const n in e)r.push(...un({key:`${t}.${n}`,value:e[n]}));return r}}};function hn(t){const e=t.value,r=t.key,n=t.styleSpec,i=t.style,a=t.validateSpec;if(!e.type)return [new tt(r,e,'"type" is required')];const s=Jr(e.type);let o;switch(s){case"vector":case"raster":case"raster-dem":return o=Yr({key:r,value:e,valueSpec:n[`source_${s.replace("-","_")}`],style:t.style,styleSpec:n,objectElementValidators:cn,validateSpec:a}),o;case"geojson":if(o=Yr({key:r,value:e,valueSpec:n.source_geojson,style:i,styleSpec:n,validateSpec:a,objectElementValidators:cn}),e.cluster)for(const t in e.clusterProperties){const[n,i]=e.clusterProperties[t],s="string"==typeof n?[n,["accumulated"],["get",t]]:n;o.push(...tn({key:`${r}.${t}.map`,value:i,validateSpec:a,expressionContext:"cluster-map"})),o.push(...tn({key:`${r}.${t}.reduce`,value:s,validateSpec:a,expressionContext:"cluster-reduce"}));}return o;case"video":return Yr({key:r,value:e,valueSpec:n.source_video,style:i,validateSpec:a,styleSpec:n});case"image":return Yr({key:r,value:e,valueSpec:n.source_image,style:i,validateSpec:a,styleSpec:n});case"canvas":return [new tt(r,null,"Please use runtime APIs to add canvas sources, rather than including them in stylesheets.","source.canvas")];default:return en({key:`${r}.type`,value:e.type,valueSpec:{values:["vector","raster","raster-dem","geojson","video","image"]},style:i,validateSpec:a,styleSpec:n})}}function pn(t){const e=t.value,r=t.styleSpec,n=r.light,i=t.style;let a=[];const s=xr(e);if(void 0===e)return a;if("object"!==s)return a=a.concat([new tt("light",e,`object expected, ${s} found`)]),a;for(const s in e){const o=s.match(/^(.*)-transition$/);a=a.concat(o&&n[o[1]]&&n[o[1]].transition?t.validateSpec({key:s,value:e[s],valueSpec:r.transition,validateSpec:t.validateSpec,style:i,styleSpec:r}):n[s]?t.validateSpec({key:s,value:e[s],valueSpec:n[s],validateSpec:t.validateSpec,style:i,styleSpec:r}):[new tt(s,e[s],`unknown property "${s}"`)]);}return a}function fn(t){const e=t.value,r=t.styleSpec,n=r.terrain,i=t.style;let a=[];const s=xr(e);if(void 0===e)return a;if("object"!==s)return a=a.concat([new tt("terrain",e,`object expected, ${s} found`)]),a;for(const s in e)a=a.concat(n[s]?t.validateSpec({key:s,value:e[s],valueSpec:n[s],validateSpec:t.validateSpec,style:i,styleSpec:r}):[new tt(s,e[s],`unknown property "${s}"`)]);return a}function dn(t){let e=[];const r=t.value,n=t.key;if(Array.isArray(r)){const i=[],a=[];for(const s in r)r[s].id&&i.includes(r[s].id)&&e.push(new tt(n,r,`all the sprites' ids must be unique, but ${r[s].id} is duplicated`)),i.push(r[s].id),r[s].url&&a.includes(r[s].url)&&e.push(new tt(n,r,`all the sprites' URLs must be unique, but ${r[s].url} is duplicated`)),a.push(r[s].url),e=e.concat(Yr({key:`${n}[${s}]`,value:r[s],valueSpec:{id:{type:"string",required:!0},url:{type:"string",required:!0}},validateSpec:t.validateSpec}));return e}return un({key:n,value:r})}const yn={"*":()=>[],array:Hr,boolean:function(t){const e=t.value,r=t.key,n=xr(e);return "boolean"!==n?[new tt(r,e,`boolean expected, ${n} found`)]:[]},number:Wr,color:function(t){const e=t.key,r=t.value,n=xr(r);return "string"!==n?[new tt(e,r,`color expected, ${n} found`)]:jt.parse(String(r))?[]:[new tt(e,r,`color expected, "${r}" found`)]},constants:Gr,enum:en,filter:rn,function:Qr,layer:ln,object:Yr,source:hn,light:pn,terrain:fn,string:un,formatted:function(t){return 0===un(t).length?[]:tn(t)},resolvedImage:function(t){return 0===un(t).length?[]:tn(t)},padding:function(t){const e=t.key,r=t.value;if("array"===xr(r)){if(r.length<1||r.length>4)return [new tt(e,r,`padding requires 1 to 4 values; ${r.length} values found`)];const n={type:"number"};let i=[];for(let a=0;a<r.length;a++)i=i.concat(t.validateSpec({key:`${e}[${a}]`,value:r[a],validateSpec:t.validateSpec,valueSpec:n}));return i}return Wr({key:e,value:r,valueSpec:{}})},variableAnchorOffsetCollection:function(t){const e=t.key,r=t.value,n=xr(r),i=t.styleSpec;if("array"!==n||r.length<1||r.length%2!=0)return [new tt(e,r,"variableAnchorOffsetCollection requires a non-empty array of even length")];let a=[];for(let n=0;n<r.length;n+=2)a=a.concat(en({key:`${e}[${n}]`,value:r[n],valueSpec:i.layout_symbol["text-anchor"]})),a=a.concat(Hr({key:`${e}[${n+1}]`,value:r[n+1],valueSpec:{length:2,value:"number"},validateSpec:t.validateSpec,style:t.style,styleSpec:i}));return a},sprite:dn};function mn(t){const e=t.value,r=t.valueSpec,n=t.styleSpec;return t.validateSpec=mn,r.expression&&vr(Jr(e))?Qr(t):r.expression&&Mr(Xr(e))?tn(t):r.type&&yn[r.type]?yn[r.type](t):Yr(et({},t,{valueSpec:r.type?n[r.type]:r}))}function gn(t){const e=t.value,r=t.key,n=un(t);return n.length||(-1===e.indexOf("{fontstack}")&&n.push(new tt(r,e,'"glyphs" url must include a "{fontstack}" token')),-1===e.indexOf("{range}")&&n.push(new tt(r,e,'"glyphs" url must include a "{range}" token'))),n}function xn(t,e=q){let r=[];return r=r.concat(mn({key:"",value:t,valueSpec:e.$root,styleSpec:e,style:t,validateSpec:mn,objectElementValidators:{glyphs:gn,"*":()=>[]}})),t.constants&&(r=r.concat(Gr({key:"constants",value:t.constants,style:t,styleSpec:e,validateSpec:mn}))),bn(r)}function vn(t){return function(e){return t({...e,validateSpec:mn})}}function bn(t){return [].concat(t).sort(((t,e)=>t.line-e.line))}function wn(t){return function(...e){return bn(t.apply(this,e))}}xn.source=wn(vn(hn)),xn.sprite=wn(vn(dn)),xn.glyphs=wn(vn(gn)),xn.light=wn(vn(pn)),xn.terrain=wn(vn(fn)),xn.layer=wn(vn(ln)),xn.filter=wn(vn(rn)),xn.paintProperty=wn(vn(sn)),xn.layoutProperty=wn(vn(on));const _n=xn,An=_n.light,Sn=_n.paintProperty,kn=_n.layoutProperty;function In(t,e){let r=!1;if(e&&e.length)for(const n of e)t.fire(new U(new Error(n.message))),r=!0;return r}class zn{constructor(t,e,r){const n=this.cells=[];if(t instanceof ArrayBuffer){this.arrayBuffer=t;const i=new Int32Array(this.arrayBuffer);t=i[0],this.d=(e=i[1])+2*(r=i[2]);for(let t=0;t<this.d*this.d;t++){const e=i[3+t],r=i[3+t+1];n.push(e===r?null:i.subarray(e,r));}const a=i[3+n.length+1];this.keys=i.subarray(i[3+n.length],a),this.bboxes=i.subarray(a),this.insert=this._insertReadonly;}else {this.d=e+2*r;for(let t=0;t<this.d*this.d;t++)n.push([]);this.keys=[],this.bboxes=[];}this.n=e,this.extent=t,this.padding=r,this.scale=e/t,this.uid=0;const i=r/e*t;this.min=-i,this.max=t+i;}insert(t,e,r,n,i){this._forEachCell(e,r,n,i,this._insertCell,this.uid++,void 0,void 0),this.keys.push(t),this.bboxes.push(e),this.bboxes.push(r),this.bboxes.push(n),this.bboxes.push(i);}_insertReadonly(){throw new Error("Cannot insert into a GridIndex created from an ArrayBuffer.")}_insertCell(t,e,r,n,i,a){this.cells[i].push(a);}query(t,e,r,n,i){const a=this.min,s=this.max;if(t<=a&&e<=a&&s<=r&&s<=n&&!i)return Array.prototype.slice.call(this.keys);{const a=[];return this._forEachCell(t,e,r,n,this._queryCell,a,{},i),a}}_queryCell(t,e,r,n,i,a,s,o){const l=this.cells[i];if(null!==l){const i=this.keys,u=this.bboxes;for(let c=0;c<l.length;c++){const h=l[c];if(void 0===s[h]){const l=4*h;(o?o(u[l+0],u[l+1],u[l+2],u[l+3]):t<=u[l+2]&&e<=u[l+3]&&r>=u[l+0]&&n>=u[l+1])?(s[h]=!0,a.push(i[h])):s[h]=!1;}}}}_forEachCell(t,e,r,n,i,a,s,o){const l=this._convertToCellCoord(t),u=this._convertToCellCoord(e),c=this._convertToCellCoord(r),h=this._convertToCellCoord(n);for(let p=l;p<=c;p++)for(let l=u;l<=h;l++){const u=this.d*l+p;if((!o||o(this._convertFromCellCoord(p),this._convertFromCellCoord(l),this._convertFromCellCoord(p+1),this._convertFromCellCoord(l+1)))&&i.call(this,t,e,r,n,u,a,s,o))return}}_convertFromCellCoord(t){return (t-this.padding)/this.scale}_convertToCellCoord(t){return Math.max(0,Math.min(this.d-1,Math.floor(t*this.scale)+this.padding))}toArrayBuffer(){if(this.arrayBuffer)return this.arrayBuffer;const t=this.cells,e=3+this.cells.length+1+1;let r=0;for(let t=0;t<this.cells.length;t++)r+=this.cells[t].length;const n=new Int32Array(e+r+this.keys.length+this.bboxes.length);n[0]=this.extent,n[1]=this.n,n[2]=this.padding;let i=e;for(let e=0;e<t.length;e++){const r=t[e];n[3+e]=i,n.set(r,i),i+=r.length;}return n[3+t.length]=i,n.set(this.keys,i),i+=this.keys.length,n[3+t.length+1]=i,n.set(this.bboxes,i),i+=this.bboxes.length,n.buffer}static serialize(t,e){const r=t.toArrayBuffer();return e&&e.push(r),{buffer:r}}static deserialize(t){return new zn(t.buffer)}}const Mn={};function Pn(t,e,r={}){if(Mn[t])throw new Error(`${t} is already registered.`);Object.defineProperty(e,"_classRegistryKey",{value:t,writeable:!1}),Mn[t]={klass:e,omit:r.omit||[],shallow:r.shallow||[]};}Pn("Object",Object),Pn("TransferableGridIndex",zn),Pn("Color",jt),Pn("Error",Error),Pn("AJAXError",B),Pn("ResolvedImage",Yt),Pn("StylePropertyFunction",Er),Pn("StyleExpression",zr,{omit:["_evaluator"]}),Pn("ZoomDependentExpression",Cr),Pn("ZoomConstantExpression",Br),Pn("CompoundExpression",Pe,{omit:["_evaluate"]});for(const t in lr)lr[t]._classRegistryKey||Pn(`Expression_${t}`,lr[t]);function Bn(t){return t&&"undefined"!=typeof ArrayBuffer&&(t instanceof ArrayBuffer||t.constructor&&"ArrayBuffer"===t.constructor.name)}function Cn(t,e){if(null==t||"boolean"==typeof t||"number"==typeof t||"string"==typeof t||t instanceof Boolean||t instanceof Number||t instanceof String||t instanceof Date||t instanceof RegExp||t instanceof Blob)return t;if(Bn(t))return e&&e.push(t),t;if(S(t))return e&&e.push(t),t;if(ArrayBuffer.isView(t)){const r=t;return e&&e.push(r.buffer),r}if(t instanceof ImageData)return e&&e.push(t.data.buffer),t;if(Array.isArray(t)){const r=[];for(const n of t)r.push(Cn(n,e));return r}if("object"==typeof t){const r=t.constructor,n=r._classRegistryKey;if(!n)throw new Error("can't serialize object of unregistered class");if(!Mn[n])throw new Error(`${n} is not registered.`);const i=r.serialize?r.serialize(t,e):{};if(r.serialize){if(e&&i===e[e.length-1])throw new Error("statically serialized object won't survive transfer of $name property")}else {for(const r in t){if(!t.hasOwnProperty(r))continue;if(Mn[n].omit.indexOf(r)>=0)continue;const a=t[r];i[r]=Mn[n].shallow.indexOf(r)>=0?a:Cn(a,e);}t instanceof Error&&(i.message=t.message);}if(i.$name)throw new Error("$name property is reserved for worker serialization logic.");return "Object"!==n&&(i.$name=n),i}throw new Error("can't serialize object of type "+typeof t)}function Vn(t){if(null==t||"boolean"==typeof t||"number"==typeof t||"string"==typeof t||t instanceof Boolean||t instanceof Number||t instanceof String||t instanceof Date||t instanceof RegExp||t instanceof Blob||Bn(t)||S(t)||ArrayBuffer.isView(t)||t instanceof ImageData)return t;if(Array.isArray(t))return t.map(Vn);if("object"==typeof t){const e=t.$name||"Object";if(!Mn[e])throw new Error(`can't deserialize unregistered class ${e}`);const{klass:r}=Mn[e];if(!r)throw new Error(`can't deserialize unregistered class ${e}`);if(r.deserialize)return r.deserialize(t);const n=Object.create(r.prototype);for(const r of Object.keys(t)){if("$name"===r)continue;const i=t[r];n[r]=Mn[e].shallow.indexOf(r)>=0?i:Vn(i);}return n}throw new Error("can't deserialize object of type "+typeof t)}class En{constructor(){this.first=!0;}update(t,e){const r=Math.floor(t);return this.first?(this.first=!1,this.lastIntegerZoom=r,this.lastIntegerZoomTime=0,this.lastZoom=t,this.lastFloorZoom=r,!0):(this.lastFloorZoom>r?(this.lastIntegerZoom=r+1,this.lastIntegerZoomTime=e):this.lastFloorZoom<r&&(this.lastIntegerZoom=r,this.lastIntegerZoomTime=e),t!==this.lastZoom&&(this.lastZoom=t,this.lastFloorZoom=r,!0))}}const Tn={"Latin-1 Supplement":t=>t>=128&&t<=255,Arabic:t=>t>=1536&&t<=1791,"Arabic Supplement":t=>t>=1872&&t<=1919,"Arabic Extended-A":t=>t>=2208&&t<=2303,"Hangul Jamo":t=>t>=4352&&t<=4607,"Unified Canadian Aboriginal Syllabics":t=>t>=5120&&t<=5759,Khmer:t=>t>=6016&&t<=6143,"Unified Canadian Aboriginal Syllabics Extended":t=>t>=6320&&t<=6399,"General Punctuation":t=>t>=8192&&t<=8303,"Letterlike Symbols":t=>t>=8448&&t<=8527,"Number Forms":t=>t>=8528&&t<=8591,"Miscellaneous Technical":t=>t>=8960&&t<=9215,"Control Pictures":t=>t>=9216&&t<=9279,"Optical Character Recognition":t=>t>=9280&&t<=9311,"Enclosed Alphanumerics":t=>t>=9312&&t<=9471,"Geometric Shapes":t=>t>=9632&&t<=9727,"Miscellaneous Symbols":t=>t>=9728&&t<=9983,"Miscellaneous Symbols and Arrows":t=>t>=11008&&t<=11263,"CJK Radicals Supplement":t=>t>=11904&&t<=12031,"Kangxi Radicals":t=>t>=12032&&t<=12255,"Ideographic Description Characters":t=>t>=12272&&t<=12287,"CJK Symbols and Punctuation":t=>t>=12288&&t<=12351,Hiragana:t=>t>=12352&&t<=12447,Katakana:t=>t>=12448&&t<=12543,Bopomofo:t=>t>=12544&&t<=12591,"Hangul Compatibility Jamo":t=>t>=12592&&t<=12687,Kanbun:t=>t>=12688&&t<=12703,"Bopomofo Extended":t=>t>=12704&&t<=12735,"CJK Strokes":t=>t>=12736&&t<=12783,"Katakana Phonetic Extensions":t=>t>=12784&&t<=12799,"Enclosed CJK Letters and Months":t=>t>=12800&&t<=13055,"CJK Compatibility":t=>t>=13056&&t<=13311,"CJK Unified Ideographs Extension A":t=>t>=13312&&t<=19903,"Yijing Hexagram Symbols":t=>t>=19904&&t<=19967,"CJK Unified Ideographs":t=>t>=19968&&t<=40959,"Yi Syllables":t=>t>=40960&&t<=42127,"Yi Radicals":t=>t>=42128&&t<=42191,"Hangul Jamo Extended-A":t=>t>=43360&&t<=43391,"Hangul Syllables":t=>t>=44032&&t<=55215,"Hangul Jamo Extended-B":t=>t>=55216&&t<=55295,"Private Use Area":t=>t>=57344&&t<=63743,"CJK Compatibility Ideographs":t=>t>=63744&&t<=64255,"Arabic Presentation Forms-A":t=>t>=64336&&t<=65023,"Vertical Forms":t=>t>=65040&&t<=65055,"CJK Compatibility Forms":t=>t>=65072&&t<=65103,"Small Form Variants":t=>t>=65104&&t<=65135,"Arabic Presentation Forms-B":t=>t>=65136&&t<=65279,"Halfwidth and Fullwidth Forms":t=>t>=65280&&t<=65519};function Fn(t){for(const e of t)if(Dn(e.charCodeAt(0)))return !0;return !1}function Ln(t){for(const e of t)if(!$n(e.charCodeAt(0)))return !1;return !0}function $n(t){return !(Tn.Arabic(t)||Tn["Arabic Supplement"](t)||Tn["Arabic Extended-A"](t)||Tn["Arabic Presentation Forms-A"](t)||Tn["Arabic Presentation Forms-B"](t))}function Dn(t){return !(746!==t&&747!==t&&(t<4352||!(Tn["Bopomofo Extended"](t)||Tn.Bopomofo(t)||Tn["CJK Compatibility Forms"](t)&&!(t>=65097&&t<=65103)||Tn["CJK Compatibility Ideographs"](t)||Tn["CJK Compatibility"](t)||Tn["CJK Radicals Supplement"](t)||Tn["CJK Strokes"](t)||!(!Tn["CJK Symbols and Punctuation"](t)||t>=12296&&t<=12305||t>=12308&&t<=12319||12336===t)||Tn["CJK Unified Ideographs Extension A"](t)||Tn["CJK Unified Ideographs"](t)||Tn["Enclosed CJK Letters and Months"](t)||Tn["Hangul Compatibility Jamo"](t)||Tn["Hangul Jamo Extended-A"](t)||Tn["Hangul Jamo Extended-B"](t)||Tn["Hangul Jamo"](t)||Tn["Hangul Syllables"](t)||Tn.Hiragana(t)||Tn["Ideographic Description Characters"](t)||Tn.Kanbun(t)||Tn["Kangxi Radicals"](t)||Tn["Katakana Phonetic Extensions"](t)||Tn.Katakana(t)&&12540!==t||!(!Tn["Halfwidth and Fullwidth Forms"](t)||65288===t||65289===t||65293===t||t>=65306&&t<=65310||65339===t||65341===t||65343===t||t>=65371&&t<=65503||65507===t||t>=65512&&t<=65519)||!(!Tn["Small Form Variants"](t)||t>=65112&&t<=65118||t>=65123&&t<=65126)||Tn["Unified Canadian Aboriginal Syllabics"](t)||Tn["Unified Canadian Aboriginal Syllabics Extended"](t)||Tn["Vertical Forms"](t)||Tn["Yijing Hexagram Symbols"](t)||Tn["Yi Syllables"](t)||Tn["Yi Radicals"](t))))}function On(t){return !(Dn(t)||function(t){return !!(Tn["Latin-1 Supplement"](t)&&(167===t||169===t||174===t||177===t||188===t||189===t||190===t||215===t||247===t)||Tn["General Punctuation"](t)&&(8214===t||8224===t||8225===t||8240===t||8241===t||8251===t||8252===t||8258===t||8263===t||8264===t||8265===t||8273===t)||Tn["Letterlike Symbols"](t)||Tn["Number Forms"](t)||Tn["Miscellaneous Technical"](t)&&(t>=8960&&t<=8967||t>=8972&&t<=8991||t>=8996&&t<=9e3||9003===t||t>=9085&&t<=9114||t>=9150&&t<=9165||9167===t||t>=9169&&t<=9179||t>=9186&&t<=9215)||Tn["Control Pictures"](t)&&9251!==t||Tn["Optical Character Recognition"](t)||Tn["Enclosed Alphanumerics"](t)||Tn["Geometric Shapes"](t)||Tn["Miscellaneous Symbols"](t)&&!(t>=9754&&t<=9759)||Tn["Miscellaneous Symbols and Arrows"](t)&&(t>=11026&&t<=11055||t>=11088&&t<=11097||t>=11192&&t<=11243)||Tn["CJK Symbols and Punctuation"](t)||Tn.Katakana(t)||Tn["Private Use Area"](t)||Tn["CJK Compatibility Forms"](t)||Tn["Small Form Variants"](t)||Tn["Halfwidth and Fullwidth Forms"](t)||8734===t||8756===t||8757===t||t>=9984&&t<=10087||t>=10102&&t<=10131||65532===t||65533===t)}(t))}function Un(t){return t>=1424&&t<=2303||Tn["Arabic Presentation Forms-A"](t)||Tn["Arabic Presentation Forms-B"](t)}function Rn(t,e){return !(!e&&Un(t)||t>=2304&&t<=3583||t>=3840&&t<=4255||Tn.Khmer(t))}function qn(t){for(const e of t)if(Un(e.charCodeAt(0)))return !0;return !1}const jn="deferred",Nn="loading",Zn="loaded";let Kn=null,Gn="unavailable",Jn=null;const Xn=function(t){t&&"string"==typeof t&&t.indexOf("NetworkError")>-1&&(Gn="error"),Kn&&Kn(t);};function Yn(){Hn.fire(new O("pluginStateChange",{pluginStatus:Gn,pluginURL:Jn}));}const Hn=new R,Wn=function(){return Gn},Qn=function(){if(Gn!==jn||!Jn)throw new Error("rtl-text-plugin cannot be downloaded unless a pluginURL is specified");Gn=Nn,Yn(),Jn&&F({url:Jn},(t=>{t?Xn(t):(Gn=Zn,Yn());}));},ti={applyArabicShaping:null,processBidirectionalText:null,processStyledBidirectionalText:null,isLoaded:()=>Gn===Zn||null!=ti.applyArabicShaping,isLoading:()=>Gn===Nn,setState(t){if(!w())throw new Error("Cannot set the state of the rtl-text-plugin when not in the web-worker context");Gn=t.pluginStatus,Jn=t.pluginURL;},isParsed(){if(!w())throw new Error("rtl-text-plugin is only parsed on the worker-threads");return null!=ti.applyArabicShaping&&null!=ti.processBidirectionalText&&null!=ti.processStyledBidirectionalText},getPluginURL(){if(!w())throw new Error("rtl-text-plugin url can only be queried from the worker threads");return Jn}};class ei{constructor(t,e){this.zoom=t,e?(this.now=e.now,this.fadeDuration=e.fadeDuration,this.zoomHistory=e.zoomHistory,this.transition=e.transition):(this.now=0,this.fadeDuration=0,this.zoomHistory=new En,this.transition={});}isSupportedScript(t){return function(t,e){for(const r of t)if(!Rn(r.charCodeAt(0),e))return !1;return !0}(t,ti.isLoaded())}crossFadingFactor(){return 0===this.fadeDuration?1:Math.min((this.now-this.zoomHistory.lastIntegerZoomTime)/this.fadeDuration,1)}getCrossfadeParameters(){const t=this.zoom,e=t-Math.floor(t),r=this.crossFadingFactor();return t>this.zoomHistory.lastIntegerZoom?{fromScale:2,toScale:1,t:e+(1-e)*r}:{fromScale:.5,toScale:1,t:1-(1-r)*e}}}class ri{constructor(t,e){this.property=t,this.value=e,this.expression=function(t,e){if(vr(t))return new Er(t,e);if(Mr(t)){const r=Vr(t,e);if("error"===r.result)throw new Error(r.value.map((t=>`${t.key}: ${t.message}`)).join(", "));return r.value}{let r=t;return "color"===e.type&&"string"==typeof t?r=jt.parse(t):"padding"!==e.type||"number"!=typeof t&&!Array.isArray(t)?"variableAnchorOffsetCollection"===e.type&&Array.isArray(t)&&(r=Xt.parse(t)):r=Gt.parse(t),{kind:"constant",evaluate:()=>r}}}(void 0===e?t.specification.default:e,t.specification);}isDataDriven(){return "source"===this.expression.kind||"composite"===this.expression.kind}possiblyEvaluate(t,e,r){return this.property.possiblyEvaluate(this,t,e,r)}}class ni{constructor(t){this.property=t,this.value=new ri(t,void 0);}transitioned(t,e){return new ai(this.property,this.value,e,p({},t.transition,this.transition),t.now)}untransitioned(){return new ai(this.property,this.value,null,{},0)}}class ii{constructor(t){this._properties=t,this._values=Object.create(t.defaultTransitionablePropertyValues);}getValue(t){return m(this._values[t].value.value)}setValue(t,e){Object.prototype.hasOwnProperty.call(this._values,t)||(this._values[t]=new ni(this._values[t].property)),this._values[t].value=new ri(this._values[t].property,null===e?void 0:m(e));}getTransition(t){return m(this._values[t].transition)}setTransition(t,e){Object.prototype.hasOwnProperty.call(this._values,t)||(this._values[t]=new ni(this._values[t].property)),this._values[t].transition=m(e)||void 0;}serialize(){const t={};for(const e of Object.keys(this._values)){const r=this.getValue(e);void 0!==r&&(t[e]=r);const n=this.getTransition(e);void 0!==n&&(t[`${e}-transition`]=n);}return t}transitioned(t,e){const r=new si(this._properties);for(const n of Object.keys(this._values))r._values[n]=this._values[n].transitioned(t,e._values[n]);return r}untransitioned(){const t=new si(this._properties);for(const e of Object.keys(this._values))t._values[e]=this._values[e].untransitioned();return t}}class ai{constructor(t,e,r,n,i){this.property=t,this.value=e,this.begin=i+n.delay||0,this.end=this.begin+n.duration||0,t.specification.transition&&(n.delay||n.duration)&&(this.prior=r);}possiblyEvaluate(t,e,r){const n=t.now||0,i=this.value.possiblyEvaluate(t,e,r),a=this.prior;if(a){if(n>this.end)return this.prior=null,i;if(this.value.isDataDriven())return this.prior=null,i;if(n<this.begin)return a.possiblyEvaluate(t,e,r);{const s=(n-this.begin)/(this.end-this.begin);return this.property.interpolate(a.possiblyEvaluate(t,e,r),i,function(t){if(t<=0)return 0;if(t>=1)return 1;const e=t*t,r=e*t;return 4*(t<.5?r:3*(t-e)+r-.75)}(s))}}return i}}class si{constructor(t){this._properties=t,this._values=Object.create(t.defaultTransitioningPropertyValues);}possiblyEvaluate(t,e,r){const n=new ui(this._properties);for(const i of Object.keys(this._values))n._values[i]=this._values[i].possiblyEvaluate(t,e,r);return n}hasTransition(){for(const t of Object.keys(this._values))if(this._values[t].prior)return !0;return !1}}class oi{constructor(t){this._properties=t,this._values=Object.create(t.defaultPropertyValues);}hasValue(t){return void 0!==this._values[t].value}getValue(t){return m(this._values[t].value)}setValue(t,e){this._values[t]=new ri(this._values[t].property,null===e?void 0:m(e));}serialize(){const t={};for(const e of Object.keys(this._values)){const r=this.getValue(e);void 0!==r&&(t[e]=r);}return t}possiblyEvaluate(t,e,r){const n=new ui(this._properties);for(const i of Object.keys(this._values))n._values[i]=this._values[i].possiblyEvaluate(t,e,r);return n}}class li{constructor(t,e,r){this.property=t,this.value=e,this.parameters=r;}isConstant(){return "constant"===this.value.kind}constantOr(t){return "constant"===this.value.kind?this.value.value:t}evaluate(t,e,r,n){return this.property.evaluate(this.value,this.parameters,t,e,r,n)}}class ui{constructor(t){this._properties=t,this._values=Object.create(t.defaultPossiblyEvaluatedValues);}get(t){return this._values[t]}}class ci{constructor(t){this.specification=t;}possiblyEvaluate(t,e){if(t.isDataDriven())throw new Error("Value should not be data driven");return t.expression.evaluate(e)}interpolate(t,e,r){const n=De[this.specification.type];return n?n(t,e,r):t}}class hi{constructor(t,e){this.specification=t,this.overrides=e;}possiblyEvaluate(t,e,r,n){return new li(this,"constant"===t.expression.kind||"camera"===t.expression.kind?{kind:"constant",value:t.expression.evaluate(e,null,{},r,n)}:t.expression,e)}interpolate(t,e,r){if("constant"!==t.value.kind||"constant"!==e.value.kind)return t;if(void 0===t.value.value||void 0===e.value.value)return new li(this,{kind:"constant",value:void 0},t.parameters);const n=De[this.specification.type];if(n){const i=n(t.value.value,e.value.value,r);return new li(this,{kind:"constant",value:i},t.parameters)}return t}evaluate(t,e,r,n,i,a){return "constant"===t.kind?t.value:t.evaluate(e,r,n,i,a)}}class pi extends hi{possiblyEvaluate(t,e,r,n){if(void 0===t.value)return new li(this,{kind:"constant",value:void 0},e);if("constant"===t.expression.kind){const i=t.expression.evaluate(e,null,{},r,n),a="resolvedImage"===t.property.specification.type&&"string"!=typeof i?i.name:i,s=this._calculate(a,a,a,e);return new li(this,{kind:"constant",value:s},e)}if("camera"===t.expression.kind){const r=this._calculate(t.expression.evaluate({zoom:e.zoom-1}),t.expression.evaluate({zoom:e.zoom}),t.expression.evaluate({zoom:e.zoom+1}),e);return new li(this,{kind:"constant",value:r},e)}return new li(this,t.expression,e)}evaluate(t,e,r,n,i,a){if("source"===t.kind){const s=t.evaluate(e,r,n,i,a);return this._calculate(s,s,s,e)}return "composite"===t.kind?this._calculate(t.evaluate({zoom:Math.floor(e.zoom)-1},r,n),t.evaluate({zoom:Math.floor(e.zoom)},r,n),t.evaluate({zoom:Math.floor(e.zoom)+1},r,n),e):t.value}_calculate(t,e,r,n){return n.zoom>n.zoomHistory.lastIntegerZoom?{from:t,to:e}:{from:r,to:e}}interpolate(t){return t}}class fi{constructor(t){this.specification=t;}possiblyEvaluate(t,e,r,n){if(void 0!==t.value){if("constant"===t.expression.kind){const i=t.expression.evaluate(e,null,{},r,n);return this._calculate(i,i,i,e)}return this._calculate(t.expression.evaluate(new ei(Math.floor(e.zoom-1),e)),t.expression.evaluate(new ei(Math.floor(e.zoom),e)),t.expression.evaluate(new ei(Math.floor(e.zoom+1),e)),e)}}_calculate(t,e,r,n){return n.zoom>n.zoomHistory.lastIntegerZoom?{from:t,to:e}:{from:r,to:e}}interpolate(t){return t}}class di{constructor(t){this.specification=t;}possiblyEvaluate(t,e,r,n){return !!t.expression.evaluate(e,null,{},r,n)}interpolate(){return !1}}class yi{constructor(t){this.properties=t,this.defaultPropertyValues={},this.defaultTransitionablePropertyValues={},this.defaultTransitioningPropertyValues={},this.defaultPossiblyEvaluatedValues={},this.overridableProperties=[];for(const e in t){const r=t[e];r.specification.overridable&&this.overridableProperties.push(e);const n=this.defaultPropertyValues[e]=new ri(r,void 0),i=this.defaultTransitionablePropertyValues[e]=new ni(r);this.defaultTransitioningPropertyValues[e]=i.untransitioned(),this.defaultPossiblyEvaluatedValues[e]=n.possiblyEvaluate({});}}}Pn("DataDrivenProperty",hi),Pn("DataConstantProperty",ci),Pn("CrossFadedDataDrivenProperty",pi),Pn("CrossFadedProperty",fi),Pn("ColorRampProperty",di);const mi="-transition";class gi extends R{constructor(t,e){if(super(),this.id=t.id,this.type=t.type,this._featureFilter={filter:()=>!0,needGeometry:!1},"custom"!==t.type&&(this.metadata=t.metadata,this.minzoom=t.minzoom,this.maxzoom=t.maxzoom,"background"!==t.type&&(this.source=t.source,this.sourceLayer=t["source-layer"],this.filter=t.filter),e.layout&&(this._unevaluatedLayout=new oi(e.layout)),e.paint)){this._transitionablePaint=new ii(e.paint);for(const e in t.paint)this.setPaintProperty(e,t.paint[e],{validate:!1});for(const e in t.layout)this.setLayoutProperty(e,t.layout[e],{validate:!1});this._transitioningPaint=this._transitionablePaint.untransitioned(),this.paint=new ui(e.paint);}}getCrossfadeParameters(){return this._crossfadeParameters}getLayoutProperty(t){return "visibility"===t?this.visibility:this._unevaluatedLayout.getValue(t)}setLayoutProperty(t,e,r={}){null!=e&&this._validate(kn,`layers.${this.id}.layout.${t}`,t,e,r)||("visibility"!==t?this._unevaluatedLayout.setValue(t,e):this.visibility=e);}getPaintProperty(t){return t.endsWith(mi)?this._transitionablePaint.getTransition(t.slice(0,-11)):this._transitionablePaint.getValue(t)}setPaintProperty(t,e,r={}){if(null!=e&&this._validate(Sn,`layers.${this.id}.paint.${t}`,t,e,r))return !1;if(t.endsWith(mi))return this._transitionablePaint.setTransition(t.slice(0,-11),e||void 0),!1;{const r=this._transitionablePaint._values[t],n="cross-faded-data-driven"===r.property.specification["property-type"],i=r.value.isDataDriven(),a=r.value;this._transitionablePaint.setValue(t,e),this._handleSpecialPaintPropertyUpdate(t);const s=this._transitionablePaint._values[t].value;return s.isDataDriven()||i||n||this._handleOverridablePaintPropertyUpdate(t,a,s)}}_handleSpecialPaintPropertyUpdate(t){}_handleOverridablePaintPropertyUpdate(t,e,r){return !1}isHidden(t){return !!(this.minzoom&&t<this.minzoom)||!!(this.maxzoom&&t>=this.maxzoom)||"none"===this.visibility}updateTransitions(t){this._transitioningPaint=this._transitionablePaint.transitioned(t,this._transitioningPaint);}hasTransition(){return this._transitioningPaint.hasTransition()}recalculate(t,e){t.getCrossfadeParameters&&(this._crossfadeParameters=t.getCrossfadeParameters()),this._unevaluatedLayout&&(this.layout=this._unevaluatedLayout.possiblyEvaluate(t,void 0,e)),this.paint=this._transitioningPaint.possiblyEvaluate(t,void 0,e);}serialize(){const t={id:this.id,type:this.type,source:this.source,"source-layer":this.sourceLayer,metadata:this.metadata,minzoom:this.minzoom,maxzoom:this.maxzoom,filter:this.filter,layout:this._unevaluatedLayout&&this._unevaluatedLayout.serialize(),paint:this._transitionablePaint&&this._transitionablePaint.serialize()};return this.visibility&&(t.layout=t.layout||{},t.layout.visibility=this.visibility),y(t,((t,e)=>!(void 0===t||"layout"===e&&!Object.keys(t).length||"paint"===e&&!Object.keys(t).length)))}_validate(t,e,r,n,i={}){return (!i||!1!==i.validate)&&In(this,t.call(_n,{key:e,layerType:this.type,objectKey:r,value:n,styleSpec:q,style:{glyphs:!0,sprite:!0}}))}is3D(){return !1}isTileClipped(){return !1}hasOffscreenPass(){return !1}resize(){}isStateDependent(){for(const t in this.paint._values){const e=this.paint.get(t);if(e instanceof li&&yr(e.property.specification)&&("source"===e.value.kind||"composite"===e.value.kind)&&e.value.isStateDependent)return !0}return !1}}const xi={Int8:Int8Array,Uint8:Uint8Array,Int16:Int16Array,Uint16:Uint16Array,Int32:Int32Array,Uint32:Uint32Array,Float32:Float32Array};class vi{constructor(t,e){this._structArray=t,this._pos1=e*this.size,this._pos2=this._pos1/2,this._pos4=this._pos1/4,this._pos8=this._pos1/8;}}class bi{constructor(){this.isTransferred=!1,this.capacity=-1,this.resize(0);}static serialize(t,e){return t._trim(),e&&(t.isTransferred=!0,e.push(t.arrayBuffer)),{length:t.length,arrayBuffer:t.arrayBuffer}}static deserialize(t){const e=Object.create(this.prototype);return e.arrayBuffer=t.arrayBuffer,e.length=t.length,e.capacity=t.arrayBuffer.byteLength/e.bytesPerElement,e._refreshViews(),e}_trim(){this.length!==this.capacity&&(this.capacity=this.length,this.arrayBuffer=this.arrayBuffer.slice(0,this.length*this.bytesPerElement),this._refreshViews());}clear(){this.length=0;}resize(t){this.reserve(t),this.length=t;}reserve(t){if(t>this.capacity){this.capacity=Math.max(t,Math.floor(5*this.capacity),128),this.arrayBuffer=new ArrayBuffer(this.capacity*this.bytesPerElement);const e=this.uint8;this._refreshViews(),e&&this.uint8.set(e);}}_refreshViews(){throw new Error("_refreshViews() must be implemented by each concrete StructArray layout")}}function wi(t,e=1){let r=0,n=0;return {members:t.map((t=>{const i=xi[t.type].BYTES_PER_ELEMENT,a=r=_i(r,Math.max(e,i)),s=t.components||1;return n=Math.max(n,i),r+=i*s,{name:t.name,type:t.type,components:s,offset:a}})),size:_i(r,Math.max(n,e)),alignment:e}}function _i(t,e){return Math.ceil(t/e)*e}class Ai extends bi{_refreshViews(){this.uint8=new Uint8Array(this.arrayBuffer),this.int16=new Int16Array(this.arrayBuffer);}emplaceBack(t,e){const r=this.length;return this.resize(r+1),this.emplace(r,t,e)}emplace(t,e,r){const n=2*t;return this.int16[n+0]=e,this.int16[n+1]=r,t}}Ai.prototype.bytesPerElement=4,Pn("StructArrayLayout2i4",Ai);class Si extends bi{_refreshViews(){this.uint8=new Uint8Array(this.arrayBuffer),this.int16=new Int16Array(this.arrayBuffer);}emplaceBack(t,e,r){const n=this.length;return this.resize(n+1),this.emplace(n,t,e,r)}emplace(t,e,r,n){const i=3*t;return this.int16[i+0]=e,this.int16[i+1]=r,this.int16[i+2]=n,t}}Si.prototype.bytesPerElement=6,Pn("StructArrayLayout3i6",Si);class ki extends bi{_refreshViews(){this.uint8=new Uint8Array(this.arrayBuffer),this.int16=new Int16Array(this.arrayBuffer);}emplaceBack(t,e,r,n){const i=this.length;return this.resize(i+1),this.emplace(i,t,e,r,n)}emplace(t,e,r,n,i){const a=4*t;return this.int16[a+0]=e,this.int16[a+1]=r,this.int16[a+2]=n,this.int16[a+3]=i,t}}ki.prototype.bytesPerElement=8,Pn("StructArrayLayout4i8",ki);class Ii extends bi{_refreshViews(){this.uint8=new Uint8Array(this.arrayBuffer),this.int16=new Int16Array(this.arrayBuffer);}emplaceBack(t,e,r,n,i,a){const s=this.length;return this.resize(s+1),this.emplace(s,t,e,r,n,i,a)}emplace(t,e,r,n,i,a,s){const o=6*t;return this.int16[o+0]=e,this.int16[o+1]=r,this.int16[o+2]=n,this.int16[o+3]=i,this.int16[o+4]=a,this.int16[o+5]=s,t}}Ii.prototype.bytesPerElement=12,Pn("StructArrayLayout2i4i12",Ii);class zi extends bi{_refreshViews(){this.uint8=new Uint8Array(this.arrayBuffer),this.int16=new Int16Array(this.arrayBuffer);}emplaceBack(t,e,r,n,i,a){const s=this.length;return this.resize(s+1),this.emplace(s,t,e,r,n,i,a)}emplace(t,e,r,n,i,a,s){const o=4*t,l=8*t;return this.int16[o+0]=e,this.int16[o+1]=r,this.uint8[l+4]=n,this.uint8[l+5]=i,this.uint8[l+6]=a,this.uint8[l+7]=s,t}}zi.prototype.bytesPerElement=8,Pn("StructArrayLayout2i4ub8",zi);class Mi extends bi{_refreshViews(){this.uint8=new Uint8Array(this.arrayBuffer),this.float32=new Float32Array(this.arrayBuffer);}emplaceBack(t,e){const r=this.length;return this.resize(r+1),this.emplace(r,t,e)}emplace(t,e,r){const n=2*t;return this.float32[n+0]=e,this.float32[n+1]=r,t}}Mi.prototype.bytesPerElement=8,Pn("StructArrayLayout2f8",Mi);class Pi extends bi{_refreshViews(){this.uint8=new Uint8Array(this.arrayBuffer),this.uint16=new Uint16Array(this.arrayBuffer);}emplaceBack(t,e,r,n,i,a,s,o,l,u){const c=this.length;return this.resize(c+1),this.emplace(c,t,e,r,n,i,a,s,o,l,u)}emplace(t,e,r,n,i,a,s,o,l,u,c){const h=10*t;return this.uint16[h+0]=e,this.uint16[h+1]=r,this.uint16[h+2]=n,this.uint16[h+3]=i,this.uint16[h+4]=a,this.uint16[h+5]=s,this.uint16[h+6]=o,this.uint16[h+7]=l,this.uint16[h+8]=u,this.uint16[h+9]=c,t}}Pi.prototype.bytesPerElement=20,Pn("StructArrayLayout10ui20",Pi);class Bi extends bi{_refreshViews(){this.uint8=new Uint8Array(this.arrayBuffer),this.int16=new Int16Array(this.arrayBuffer),this.uint16=new Uint16Array(this.arrayBuffer);}emplaceBack(t,e,r,n,i,a,s,o,l,u,c,h){const p=this.length;return this.resize(p+1),this.emplace(p,t,e,r,n,i,a,s,o,l,u,c,h)}emplace(t,e,r,n,i,a,s,o,l,u,c,h,p){const f=12*t;return this.int16[f+0]=e,this.int16[f+1]=r,this.int16[f+2]=n,this.int16[f+3]=i,this.uint16[f+4]=a,this.uint16[f+5]=s,this.uint16[f+6]=o,this.uint16[f+7]=l,this.int16[f+8]=u,this.int16[f+9]=c,this.int16[f+10]=h,this.int16[f+11]=p,t}}Bi.prototype.bytesPerElement=24,Pn("StructArrayLayout4i4ui4i24",Bi);class Ci extends bi{_refreshViews(){this.uint8=new Uint8Array(this.arrayBuffer),this.float32=new Float32Array(this.arrayBuffer);}emplaceBack(t,e,r){const n=this.length;return this.resize(n+1),this.emplace(n,t,e,r)}emplace(t,e,r,n){const i=3*t;return this.float32[i+0]=e,this.float32[i+1]=r,this.float32[i+2]=n,t}}Ci.prototype.bytesPerElement=12,Pn("StructArrayLayout3f12",Ci);class Vi extends bi{_refreshViews(){this.uint8=new Uint8Array(this.arrayBuffer),this.uint32=new Uint32Array(this.arrayBuffer);}emplaceBack(t){const e=this.length;return this.resize(e+1),this.emplace(e,t)}emplace(t,e){return this.uint32[1*t+0]=e,t}}Vi.prototype.bytesPerElement=4,Pn("StructArrayLayout1ul4",Vi);class Ei extends bi{_refreshViews(){this.uint8=new Uint8Array(this.arrayBuffer),this.int16=new Int16Array(this.arrayBuffer),this.uint32=new Uint32Array(this.arrayBuffer),this.uint16=new Uint16Array(this.arrayBuffer);}emplaceBack(t,e,r,n,i,a,s,o,l){const u=this.length;return this.resize(u+1),this.emplace(u,t,e,r,n,i,a,s,o,l)}emplace(t,e,r,n,i,a,s,o,l,u){const c=10*t,h=5*t;return this.int16[c+0]=e,this.int16[c+1]=r,this.int16[c+2]=n,this.int16[c+3]=i,this.int16[c+4]=a,this.int16[c+5]=s,this.uint32[h+3]=o,this.uint16[c+8]=l,this.uint16[c+9]=u,t}}Ei.prototype.bytesPerElement=20,Pn("StructArrayLayout6i1ul2ui20",Ei);class Ti extends bi{_refreshViews(){this.uint8=new Uint8Array(this.arrayBuffer),this.int16=new Int16Array(this.arrayBuffer);}emplaceBack(t,e,r,n,i,a){const s=this.length;return this.resize(s+1),this.emplace(s,t,e,r,n,i,a)}emplace(t,e,r,n,i,a,s){const o=6*t;return this.int16[o+0]=e,this.int16[o+1]=r,this.int16[o+2]=n,this.int16[o+3]=i,this.int16[o+4]=a,this.int16[o+5]=s,t}}Ti.prototype.bytesPerElement=12,Pn("StructArrayLayout2i2i2i12",Ti);class Fi extends bi{_refreshViews(){this.uint8=new Uint8Array(this.arrayBuffer),this.float32=new Float32Array(this.arrayBuffer),this.int16=new Int16Array(this.arrayBuffer);}emplaceBack(t,e,r,n,i){const a=this.length;return this.resize(a+1),this.emplace(a,t,e,r,n,i)}emplace(t,e,r,n,i,a){const s=4*t,o=8*t;return this.float32[s+0]=e,this.float32[s+1]=r,this.float32[s+2]=n,this.int16[o+6]=i,this.int16[o+7]=a,t}}Fi.prototype.bytesPerElement=16,Pn("StructArrayLayout2f1f2i16",Fi);class Li extends bi{_refreshViews(){this.uint8=new Uint8Array(this.arrayBuffer),this.float32=new Float32Array(this.arrayBuffer);}emplaceBack(t,e,r,n){const i=this.length;return this.resize(i+1),this.emplace(i,t,e,r,n)}emplace(t,e,r,n,i){const a=12*t,s=3*t;return this.uint8[a+0]=e,this.uint8[a+1]=r,this.float32[s+1]=n,this.float32[s+2]=i,t}}Li.prototype.bytesPerElement=12,Pn("StructArrayLayout2ub2f12",Li);class $i extends bi{_refreshViews(){this.uint8=new Uint8Array(this.arrayBuffer),this.uint16=new Uint16Array(this.arrayBuffer);}emplaceBack(t,e,r){const n=this.length;return this.resize(n+1),this.emplace(n,t,e,r)}emplace(t,e,r,n){const i=3*t;return this.uint16[i+0]=e,this.uint16[i+1]=r,this.uint16[i+2]=n,t}}$i.prototype.bytesPerElement=6,Pn("StructArrayLayout3ui6",$i);class Di extends bi{_refreshViews(){this.uint8=new Uint8Array(this.arrayBuffer),this.int16=new Int16Array(this.arrayBuffer),this.uint16=new Uint16Array(this.arrayBuffer),this.uint32=new Uint32Array(this.arrayBuffer),this.float32=new Float32Array(this.arrayBuffer);}emplaceBack(t,e,r,n,i,a,s,o,l,u,c,h,p,f,d,y,m){const g=this.length;return this.resize(g+1),this.emplace(g,t,e,r,n,i,a,s,o,l,u,c,h,p,f,d,y,m)}emplace(t,e,r,n,i,a,s,o,l,u,c,h,p,f,d,y,m,g){const x=24*t,v=12*t,b=48*t;return this.int16[x+0]=e,this.int16[x+1]=r,this.uint16[x+2]=n,this.uint16[x+3]=i,this.uint32[v+2]=a,this.uint32[v+3]=s,this.uint32[v+4]=o,this.uint16[x+10]=l,this.uint16[x+11]=u,this.uint16[x+12]=c,this.float32[v+7]=h,this.float32[v+8]=p,this.uint8[b+36]=f,this.uint8[b+37]=d,this.uint8[b+38]=y,this.uint32[v+10]=m,this.int16[x+22]=g,t}}Di.prototype.bytesPerElement=48,Pn("StructArrayLayout2i2ui3ul3ui2f3ub1ul1i48",Di);class Oi extends bi{_refreshViews(){this.uint8=new Uint8Array(this.arrayBuffer),this.int16=new Int16Array(this.arrayBuffer),this.uint16=new Uint16Array(this.arrayBuffer),this.uint32=new Uint32Array(this.arrayBuffer),this.float32=new Float32Array(this.arrayBuffer);}emplaceBack(t,e,r,n,i,a,s,o,l,u,c,h,p,f,d,y,m,g,x,v,b,w,_,A,S,k,I,z){const M=this.length;return this.resize(M+1),this.emplace(M,t,e,r,n,i,a,s,o,l,u,c,h,p,f,d,y,m,g,x,v,b,w,_,A,S,k,I,z)}emplace(t,e,r,n,i,a,s,o,l,u,c,h,p,f,d,y,m,g,x,v,b,w,_,A,S,k,I,z,M){const P=32*t,B=16*t;return this.int16[P+0]=e,this.int16[P+1]=r,this.int16[P+2]=n,this.int16[P+3]=i,this.int16[P+4]=a,this.int16[P+5]=s,this.int16[P+6]=o,this.int16[P+7]=l,this.uint16[P+8]=u,this.uint16[P+9]=c,this.uint16[P+10]=h,this.uint16[P+11]=p,this.uint16[P+12]=f,this.uint16[P+13]=d,this.uint16[P+14]=y,this.uint16[P+15]=m,this.uint16[P+16]=g,this.uint16[P+17]=x,this.uint16[P+18]=v,this.uint16[P+19]=b,this.uint16[P+20]=w,this.uint16[P+21]=_,this.uint16[P+22]=A,this.uint32[B+12]=S,this.float32[B+13]=k,this.float32[B+14]=I,this.uint16[P+30]=z,this.uint16[P+31]=M,t}}Oi.prototype.bytesPerElement=64,Pn("StructArrayLayout8i15ui1ul2f2ui64",Oi);class Ui extends bi{_refreshViews(){this.uint8=new Uint8Array(this.arrayBuffer),this.float32=new Float32Array(this.arrayBuffer);}emplaceBack(t){const e=this.length;return this.resize(e+1),this.emplace(e,t)}emplace(t,e){return this.float32[1*t+0]=e,t}}Ui.prototype.bytesPerElement=4,Pn("StructArrayLayout1f4",Ui);class Ri extends bi{_refreshViews(){this.uint8=new Uint8Array(this.arrayBuffer),this.uint16=new Uint16Array(this.arrayBuffer),this.float32=new Float32Array(this.arrayBuffer);}emplaceBack(t,e,r){const n=this.length;return this.resize(n+1),this.emplace(n,t,e,r)}emplace(t,e,r,n){const i=3*t;return this.uint16[6*t+0]=e,this.float32[i+1]=r,this.float32[i+2]=n,t}}Ri.prototype.bytesPerElement=12,Pn("StructArrayLayout1ui2f12",Ri);class qi extends bi{_refreshViews(){this.uint8=new Uint8Array(this.arrayBuffer),this.uint32=new Uint32Array(this.arrayBuffer),this.uint16=new Uint16Array(this.arrayBuffer);}emplaceBack(t,e,r){const n=this.length;return this.resize(n+1),this.emplace(n,t,e,r)}emplace(t,e,r,n){const i=4*t;return this.uint32[2*t+0]=e,this.uint16[i+2]=r,this.uint16[i+3]=n,t}}qi.prototype.bytesPerElement=8,Pn("StructArrayLayout1ul2ui8",qi);class ji extends bi{_refreshViews(){this.uint8=new Uint8Array(this.arrayBuffer),this.uint16=new Uint16Array(this.arrayBuffer);}emplaceBack(t,e){const r=this.length;return this.resize(r+1),this.emplace(r,t,e)}emplace(t,e,r){const n=2*t;return this.uint16[n+0]=e,this.uint16[n+1]=r,t}}ji.prototype.bytesPerElement=4,Pn("StructArrayLayout2ui4",ji);class Ni extends bi{_refreshViews(){this.uint8=new Uint8Array(this.arrayBuffer),this.uint16=new Uint16Array(this.arrayBuffer);}emplaceBack(t){const e=this.length;return this.resize(e+1),this.emplace(e,t)}emplace(t,e){return this.uint16[1*t+0]=e,t}}Ni.prototype.bytesPerElement=2,Pn("StructArrayLayout1ui2",Ni);class Zi extends bi{_refreshViews(){this.uint8=new Uint8Array(this.arrayBuffer),this.float32=new Float32Array(this.arrayBuffer);}emplaceBack(t,e,r,n){const i=this.length;return this.resize(i+1),this.emplace(i,t,e,r,n)}emplace(t,e,r,n,i){const a=4*t;return this.float32[a+0]=e,this.float32[a+1]=r,this.float32[a+2]=n,this.float32[a+3]=i,t}}Zi.prototype.bytesPerElement=16,Pn("StructArrayLayout4f16",Zi);class Ki extends vi{get anchorPointX(){return this._structArray.int16[this._pos2+0]}get anchorPointY(){return this._structArray.int16[this._pos2+1]}get x1(){return this._structArray.int16[this._pos2+2]}get y1(){return this._structArray.int16[this._pos2+3]}get x2(){return this._structArray.int16[this._pos2+4]}get y2(){return this._structArray.int16[this._pos2+5]}get featureIndex(){return this._structArray.uint32[this._pos4+3]}get sourceLayerIndex(){return this._structArray.uint16[this._pos2+8]}get bucketIndex(){return this._structArray.uint16[this._pos2+9]}get anchorPoint(){return new i(this.anchorPointX,this.anchorPointY)}}Ki.prototype.size=20;class Gi extends Ei{get(t){return new Ki(this,t)}}Pn("CollisionBoxArray",Gi);class Ji extends vi{get anchorX(){return this._structArray.int16[this._pos2+0]}get anchorY(){return this._structArray.int16[this._pos2+1]}get glyphStartIndex(){return this._structArray.uint16[this._pos2+2]}get numGlyphs(){return this._structArray.uint16[this._pos2+3]}get vertexStartIndex(){return this._structArray.uint32[this._pos4+2]}get lineStartIndex(){return this._structArray.uint32[this._pos4+3]}get lineLength(){return this._structArray.uint32[this._pos4+4]}get segment(){return this._structArray.uint16[this._pos2+10]}get lowerSize(){return this._structArray.uint16[this._pos2+11]}get upperSize(){return this._structArray.uint16[this._pos2+12]}get lineOffsetX(){return this._structArray.float32[this._pos4+7]}get lineOffsetY(){return this._structArray.float32[this._pos4+8]}get writingMode(){return this._structArray.uint8[this._pos1+36]}get placedOrientation(){return this._structArray.uint8[this._pos1+37]}set placedOrientation(t){this._structArray.uint8[this._pos1+37]=t;}get hidden(){return this._structArray.uint8[this._pos1+38]}set hidden(t){this._structArray.uint8[this._pos1+38]=t;}get crossTileID(){return this._structArray.uint32[this._pos4+10]}set crossTileID(t){this._structArray.uint32[this._pos4+10]=t;}get associatedIconIndex(){return this._structArray.int16[this._pos2+22]}}Ji.prototype.size=48;class Xi extends Di{get(t){return new Ji(this,t)}}Pn("PlacedSymbolArray",Xi);class Yi extends vi{get anchorX(){return this._structArray.int16[this._pos2+0]}get anchorY(){return this._structArray.int16[this._pos2+1]}get rightJustifiedTextSymbolIndex(){return this._structArray.int16[this._pos2+2]}get centerJustifiedTextSymbolIndex(){return this._structArray.int16[this._pos2+3]}get leftJustifiedTextSymbolIndex(){return this._structArray.int16[this._pos2+4]}get verticalPlacedTextSymbolIndex(){return this._structArray.int16[this._pos2+5]}get placedIconSymbolIndex(){return this._structArray.int16[this._pos2+6]}get verticalPlacedIconSymbolIndex(){return this._structArray.int16[this._pos2+7]}get key(){return this._structArray.uint16[this._pos2+8]}get textBoxStartIndex(){return this._structArray.uint16[this._pos2+9]}get textBoxEndIndex(){return this._structArray.uint16[this._pos2+10]}get verticalTextBoxStartIndex(){return this._structArray.uint16[this._pos2+11]}get verticalTextBoxEndIndex(){return this._structArray.uint16[this._pos2+12]}get iconBoxStartIndex(){return this._structArray.uint16[this._pos2+13]}get iconBoxEndIndex(){return this._structArray.uint16[this._pos2+14]}get verticalIconBoxStartIndex(){return this._structArray.uint16[this._pos2+15]}get verticalIconBoxEndIndex(){return this._structArray.uint16[this._pos2+16]}get featureIndex(){return this._structArray.uint16[this._pos2+17]}get numHorizontalGlyphVertices(){return this._structArray.uint16[this._pos2+18]}get numVerticalGlyphVertices(){return this._structArray.uint16[this._pos2+19]}get numIconVertices(){return this._structArray.uint16[this._pos2+20]}get numVerticalIconVertices(){return this._structArray.uint16[this._pos2+21]}get useRuntimeCollisionCircles(){return this._structArray.uint16[this._pos2+22]}get crossTileID(){return this._structArray.uint32[this._pos4+12]}set crossTileID(t){this._structArray.uint32[this._pos4+12]=t;}get textBoxScale(){return this._structArray.float32[this._pos4+13]}get collisionCircleDiameter(){return this._structArray.float32[this._pos4+14]}get textAnchorOffsetStartIndex(){return this._structArray.uint16[this._pos2+30]}get textAnchorOffsetEndIndex(){return this._structArray.uint16[this._pos2+31]}}Yi.prototype.size=64;class Hi extends Oi{get(t){return new Yi(this,t)}}Pn("SymbolInstanceArray",Hi);class Wi extends Ui{getoffsetX(t){return this.float32[1*t+0]}}Pn("GlyphOffsetArray",Wi);class Qi extends Si{getx(t){return this.int16[3*t+0]}gety(t){return this.int16[3*t+1]}gettileUnitDistanceFromAnchor(t){return this.int16[3*t+2]}}Pn("SymbolLineVertexArray",Qi);class ta extends vi{get textAnchor(){return this._structArray.uint16[this._pos2+0]}get textOffset0(){return this._structArray.float32[this._pos4+1]}get textOffset1(){return this._structArray.float32[this._pos4+2]}}ta.prototype.size=12;class ea extends Ri{get(t){return new ta(this,t)}}Pn("TextAnchorOffsetArray",ea);class ra extends vi{get featureIndex(){return this._structArray.uint32[this._pos4+0]}get sourceLayerIndex(){return this._structArray.uint16[this._pos2+2]}get bucketIndex(){return this._structArray.uint16[this._pos2+3]}}ra.prototype.size=8;class na extends qi{get(t){return new ra(this,t)}}Pn("FeatureIndexArray",na);class ia extends Ai{}class aa extends Ai{}class sa extends Ai{}class oa extends Ii{}class la extends zi{}class ua extends Mi{}class ca extends Pi{}class ha extends Bi{}class pa extends Ci{}class fa extends Vi{}class da extends Ti{}class ya extends Li{}class ma extends $i{}class ga extends ji{}const xa=wi([{name:"a_pos",components:2,type:"Int16"}],4),{members:va}=xa;class ba{constructor(t=[]){this.segments=t;}prepareSegment(t,e,r,n){let i=this.segments[this.segments.length-1];return t>ba.MAX_VERTEX_ARRAY_LENGTH&&x(`Max vertices per segment is ${ba.MAX_VERTEX_ARRAY_LENGTH}: bucket requested ${t}`),(!i||i.vertexLength+t>ba.MAX_VERTEX_ARRAY_LENGTH||i.sortKey!==n)&&(i={vertexOffset:e.length,primitiveOffset:r.length,vertexLength:0,primitiveLength:0},void 0!==n&&(i.sortKey=n),this.segments.push(i)),i}get(){return this.segments}destroy(){for(const t of this.segments)for(const e in t.vaos)t.vaos[e].destroy();}static simpleSegment(t,e,r,n){return new ba([{vertexOffset:t,primitiveOffset:e,vertexLength:r,primitiveLength:n,vaos:{},sortKey:0}])}}function wa(t,e){return 256*(t=c(Math.floor(t),0,255))+c(Math.floor(e),0,255)}ba.MAX_VERTEX_ARRAY_LENGTH=Math.pow(2,16)-1,Pn("SegmentVector",ba);const _a=wi([{name:"a_pattern_from",components:4,type:"Uint16"},{name:"a_pattern_to",components:4,type:"Uint16"},{name:"a_pixel_ratio_from",components:1,type:"Uint16"},{name:"a_pixel_ratio_to",components:1,type:"Uint16"}]);var Aa={exports:{}},Sa={exports:{}};Sa.exports=function(t,e){var r,n,i,a,s,o,l,u;for(n=t.length-(r=3&t.length),i=e,s=3432918353,o=461845907,u=0;u<n;)l=255&t.charCodeAt(u)|(255&t.charCodeAt(++u))<<8|(255&t.charCodeAt(++u))<<16|(255&t.charCodeAt(++u))<<24,++u,i=27492+(65535&(a=5*(65535&(i=(i^=l=(65535&(l=(l=(65535&l)*s+(((l>>>16)*s&65535)<<16)&4294967295)<<15|l>>>17))*o+(((l>>>16)*o&65535)<<16)&4294967295)<<13|i>>>19))+((5*(i>>>16)&65535)<<16)&4294967295))+((58964+(a>>>16)&65535)<<16);switch(l=0,r){case 3:l^=(255&t.charCodeAt(u+2))<<16;case 2:l^=(255&t.charCodeAt(u+1))<<8;case 1:i^=l=(65535&(l=(l=(65535&(l^=255&t.charCodeAt(u)))*s+(((l>>>16)*s&65535)<<16)&4294967295)<<15|l>>>17))*o+(((l>>>16)*o&65535)<<16)&4294967295;}return i^=t.length,i=2246822507*(65535&(i^=i>>>16))+((2246822507*(i>>>16)&65535)<<16)&4294967295,i=3266489909*(65535&(i^=i>>>13))+((3266489909*(i>>>16)&65535)<<16)&4294967295,(i^=i>>>16)>>>0};var ka=Sa.exports,Ia={exports:{}};Ia.exports=function(t,e){for(var r,n=t.length,i=e^n,a=0;n>=4;)r=1540483477*(65535&(r=255&t.charCodeAt(a)|(255&t.charCodeAt(++a))<<8|(255&t.charCodeAt(++a))<<16|(255&t.charCodeAt(++a))<<24))+((1540483477*(r>>>16)&65535)<<16),i=1540483477*(65535&i)+((1540483477*(i>>>16)&65535)<<16)^(r=1540483477*(65535&(r^=r>>>24))+((1540483477*(r>>>16)&65535)<<16)),n-=4,++a;switch(n){case 3:i^=(255&t.charCodeAt(a+2))<<16;case 2:i^=(255&t.charCodeAt(a+1))<<8;case 1:i=1540483477*(65535&(i^=255&t.charCodeAt(a)))+((1540483477*(i>>>16)&65535)<<16);}return i=1540483477*(65535&(i^=i>>>13))+((1540483477*(i>>>16)&65535)<<16),(i^=i>>>15)>>>0};var za=ka,Ma=Ia.exports;Aa.exports=za,Aa.exports.murmur3=za,Aa.exports.murmur2=Ma;var Pa=e(Aa.exports);class Ba{constructor(){this.ids=[],this.positions=[],this.indexed=!1;}add(t,e,r,n){this.ids.push(Ca(t)),this.positions.push(e,r,n);}getPositions(t){if(!this.indexed)throw new Error("Trying to get index, but feature positions are not indexed");const e=Ca(t);let r=0,n=this.ids.length-1;for(;r<n;){const t=r+n>>1;this.ids[t]>=e?n=t:r=t+1;}const i=[];for(;this.ids[r]===e;)i.push({index:this.positions[3*r],start:this.positions[3*r+1],end:this.positions[3*r+2]}),r++;return i}static serialize(t,e){const r=new Float64Array(t.ids),n=new Uint32Array(t.positions);return Va(r,n,0,r.length-1),e&&e.push(r.buffer,n.buffer),{ids:r,positions:n}}static deserialize(t){const e=new Ba;return e.ids=t.ids,e.positions=t.positions,e.indexed=!0,e}}function Ca(t){const e=+t;return !isNaN(e)&&e<=Number.MAX_SAFE_INTEGER?e:Pa(String(t))}function Va(t,e,r,n){for(;r<n;){const i=t[r+n>>1];let a=r-1,s=n+1;for(;;){do{a++;}while(t[a]<i);do{s--;}while(t[s]>i);if(a>=s)break;Ea(t,a,s),Ea(e,3*a,3*s),Ea(e,3*a+1,3*s+1),Ea(e,3*a+2,3*s+2);}s-r<n-s?(Va(t,e,r,s),r=s+1):(Va(t,e,s+1,n),n=s);}}function Ea(t,e,r){const n=t[e];t[e]=t[r],t[r]=n;}Pn("FeaturePositionMap",Ba);class Ta{constructor(t,e){this.gl=t.gl,this.location=e;}}class Fa extends Ta{constructor(t,e){super(t,e),this.current=0;}set(t){this.current!==t&&(this.current=t,this.gl.uniform1f(this.location,t));}}class La extends Ta{constructor(t,e){super(t,e),this.current=[0,0,0,0];}set(t){t[0]===this.current[0]&&t[1]===this.current[1]&&t[2]===this.current[2]&&t[3]===this.current[3]||(this.current=t,this.gl.uniform4f(this.location,t[0],t[1],t[2],t[3]));}}class $a extends Ta{constructor(t,e){super(t,e),this.current=jt.transparent;}set(t){t.r===this.current.r&&t.g===this.current.g&&t.b===this.current.b&&t.a===this.current.a||(this.current=t,this.gl.uniform4f(this.location,t.r,t.g,t.b,t.a));}}const Da=new Float32Array(16);function Oa(t){return [wa(255*t.r,255*t.g),wa(255*t.b,255*t.a)]}class Ua{constructor(t,e,r){this.value=t,this.uniformNames=e.map((t=>`u_${t}`)),this.type=r;}setUniform(t,e,r){t.set(r.constantOr(this.value));}getBinding(t,e,r){return "color"===this.type?new $a(t,e):new Fa(t,e)}}class Ra{constructor(t,e){this.uniformNames=e.map((t=>`u_${t}`)),this.patternFrom=null,this.patternTo=null,this.pixelRatioFrom=1,this.pixelRatioTo=1;}setConstantPatternPositions(t,e){this.pixelRatioFrom=e.pixelRatio,this.pixelRatioTo=t.pixelRatio,this.patternFrom=e.tlbr,this.patternTo=t.tlbr;}setUniform(t,e,r,n){const i="u_pattern_to"===n?this.patternTo:"u_pattern_from"===n?this.patternFrom:"u_pixel_ratio_to"===n?this.pixelRatioTo:"u_pixel_ratio_from"===n?this.pixelRatioFrom:null;i&&t.set(i);}getBinding(t,e,r){return "u_pattern"===r.substr(0,9)?new La(t,e):new Fa(t,e)}}class qa{constructor(t,e,r,n){this.expression=t,this.type=r,this.maxValue=0,this.paintVertexAttributes=e.map((t=>({name:`a_${t}`,type:"Float32",components:"color"===r?2:1,offset:0}))),this.paintVertexArray=new n;}populatePaintArray(t,e,r,n,i){const a=this.paintVertexArray.length,s=this.expression.evaluate(new ei(0),e,{},n,[],i);this.paintVertexArray.resize(t),this._setPaintValue(a,t,s);}updatePaintArray(t,e,r,n){const i=this.expression.evaluate({zoom:0},r,n);this._setPaintValue(t,e,i);}_setPaintValue(t,e,r){if("color"===this.type){const n=Oa(r);for(let r=t;r<e;r++)this.paintVertexArray.emplace(r,n[0],n[1]);}else {for(let n=t;n<e;n++)this.paintVertexArray.emplace(n,r);this.maxValue=Math.max(this.maxValue,Math.abs(r));}}upload(t){this.paintVertexArray&&this.paintVertexArray.arrayBuffer&&(this.paintVertexBuffer&&this.paintVertexBuffer.buffer?this.paintVertexBuffer.updateData(this.paintVertexArray):this.paintVertexBuffer=t.createVertexBuffer(this.paintVertexArray,this.paintVertexAttributes,this.expression.isStateDependent));}destroy(){this.paintVertexBuffer&&this.paintVertexBuffer.destroy();}}class ja{constructor(t,e,r,n,i,a){this.expression=t,this.uniformNames=e.map((t=>`u_${t}_t`)),this.type=r,this.useIntegerZoom=n,this.zoom=i,this.maxValue=0,this.paintVertexAttributes=e.map((t=>({name:`a_${t}`,type:"Float32",components:"color"===r?4:2,offset:0}))),this.paintVertexArray=new a;}populatePaintArray(t,e,r,n,i){const a=this.expression.evaluate(new ei(this.zoom),e,{},n,[],i),s=this.expression.evaluate(new ei(this.zoom+1),e,{},n,[],i),o=this.paintVertexArray.length;this.paintVertexArray.resize(t),this._setPaintValue(o,t,a,s);}updatePaintArray(t,e,r,n){const i=this.expression.evaluate({zoom:this.zoom},r,n),a=this.expression.evaluate({zoom:this.zoom+1},r,n);this._setPaintValue(t,e,i,a);}_setPaintValue(t,e,r,n){if("color"===this.type){const i=Oa(r),a=Oa(n);for(let r=t;r<e;r++)this.paintVertexArray.emplace(r,i[0],i[1],a[0],a[1]);}else {for(let i=t;i<e;i++)this.paintVertexArray.emplace(i,r,n);this.maxValue=Math.max(this.maxValue,Math.abs(r),Math.abs(n));}}upload(t){this.paintVertexArray&&this.paintVertexArray.arrayBuffer&&(this.paintVertexBuffer&&this.paintVertexBuffer.buffer?this.paintVertexBuffer.updateData(this.paintVertexArray):this.paintVertexBuffer=t.createVertexBuffer(this.paintVertexArray,this.paintVertexAttributes,this.expression.isStateDependent));}destroy(){this.paintVertexBuffer&&this.paintVertexBuffer.destroy();}setUniform(t,e){const r=this.useIntegerZoom?Math.floor(e.zoom):e.zoom,n=c(this.expression.interpolationFactor(r,this.zoom,this.zoom+1),0,1);t.set(n);}getBinding(t,e,r){return new Fa(t,e)}}class Na{constructor(t,e,r,n,i,a){this.expression=t,this.type=e,this.useIntegerZoom=r,this.zoom=n,this.layerId=a,this.zoomInPaintVertexArray=new i,this.zoomOutPaintVertexArray=new i;}populatePaintArray(t,e,r){const n=this.zoomInPaintVertexArray.length;this.zoomInPaintVertexArray.resize(t),this.zoomOutPaintVertexArray.resize(t),this._setPaintValues(n,t,e.patterns&&e.patterns[this.layerId],r);}updatePaintArray(t,e,r,n,i){this._setPaintValues(t,e,r.patterns&&r.patterns[this.layerId],i);}_setPaintValues(t,e,r,n){if(!n||!r)return;const{min:i,mid:a,max:s}=r,o=n[i],l=n[a],u=n[s];if(o&&l&&u)for(let r=t;r<e;r++)this.zoomInPaintVertexArray.emplace(r,l.tl[0],l.tl[1],l.br[0],l.br[1],o.tl[0],o.tl[1],o.br[0],o.br[1],l.pixelRatio,o.pixelRatio),this.zoomOutPaintVertexArray.emplace(r,l.tl[0],l.tl[1],l.br[0],l.br[1],u.tl[0],u.tl[1],u.br[0],u.br[1],l.pixelRatio,u.pixelRatio);}upload(t){this.zoomInPaintVertexArray&&this.zoomInPaintVertexArray.arrayBuffer&&this.zoomOutPaintVertexArray&&this.zoomOutPaintVertexArray.arrayBuffer&&(this.zoomInPaintVertexBuffer=t.createVertexBuffer(this.zoomInPaintVertexArray,_a.members,this.expression.isStateDependent),this.zoomOutPaintVertexBuffer=t.createVertexBuffer(this.zoomOutPaintVertexArray,_a.members,this.expression.isStateDependent));}destroy(){this.zoomOutPaintVertexBuffer&&this.zoomOutPaintVertexBuffer.destroy(),this.zoomInPaintVertexBuffer&&this.zoomInPaintVertexBuffer.destroy();}}class Za{constructor(t,e,r){this.binders={},this._buffers=[];const n=[];for(const i in t.paint._values){if(!r(i))continue;const a=t.paint.get(i);if(!(a instanceof li&&yr(a.property.specification)))continue;const s=Ga(i,t.type),o=a.value,l=a.property.specification.type,u=a.property.useIntegerZoom,c=a.property.specification["property-type"],h="cross-faded"===c||"cross-faded-data-driven"===c;if("constant"===o.kind)this.binders[i]=h?new Ra(o.value,s):new Ua(o.value,s,l),n.push(`/u_${i}`);else if("source"===o.kind||h){const r=Ja(i,l,"source");this.binders[i]=h?new Na(o,l,u,e,r,t.id):new qa(o,s,l,r),n.push(`/a_${i}`);}else {const t=Ja(i,l,"composite");this.binders[i]=new ja(o,s,l,u,e,t),n.push(`/z_${i}`);}}this.cacheKey=n.sort().join("");}getMaxValue(t){const e=this.binders[t];return e instanceof qa||e instanceof ja?e.maxValue:0}populatePaintArrays(t,e,r,n,i){for(const a in this.binders){const s=this.binders[a];(s instanceof qa||s instanceof ja||s instanceof Na)&&s.populatePaintArray(t,e,r,n,i);}}setConstantPatternPositions(t,e){for(const r in this.binders){const n=this.binders[r];n instanceof Ra&&n.setConstantPatternPositions(t,e);}}updatePaintArrays(t,e,r,n,i){let a=!1;for(const s in t){const o=e.getPositions(s);for(const e of o){const o=r.feature(e.index);for(const r in this.binders){const l=this.binders[r];if((l instanceof qa||l instanceof ja||l instanceof Na)&&!0===l.expression.isStateDependent){const u=n.paint.get(r);l.expression=u.value,l.updatePaintArray(e.start,e.end,o,t[s],i),a=!0;}}}}return a}defines(){const t=[];for(const e in this.binders){const r=this.binders[e];(r instanceof Ua||r instanceof Ra)&&t.push(...r.uniformNames.map((t=>`#define HAS_UNIFORM_${t}`)));}return t}getBinderAttributes(){const t=[];for(const e in this.binders){const r=this.binders[e];if(r instanceof qa||r instanceof ja)for(let e=0;e<r.paintVertexAttributes.length;e++)t.push(r.paintVertexAttributes[e].name);else if(r instanceof Na)for(let e=0;e<_a.members.length;e++)t.push(_a.members[e].name);}return t}getBinderUniforms(){const t=[];for(const e in this.binders){const r=this.binders[e];if(r instanceof Ua||r instanceof Ra||r instanceof ja)for(const e of r.uniformNames)t.push(e);}return t}getPaintVertexBuffers(){return this._buffers}getUniforms(t,e){const r=[];for(const n in this.binders){const i=this.binders[n];if(i instanceof Ua||i instanceof Ra||i instanceof ja)for(const a of i.uniformNames)if(e[a]){const s=i.getBinding(t,e[a],a);r.push({name:a,property:n,binding:s});}}return r}setUniforms(t,e,r,n){for(const{name:t,property:i,binding:a}of e)this.binders[i].setUniform(a,n,r.get(i),t);}updatePaintBuffers(t){this._buffers=[];for(const e in this.binders){const r=this.binders[e];if(t&&r instanceof Na){const e=2===t.fromScale?r.zoomInPaintVertexBuffer:r.zoomOutPaintVertexBuffer;e&&this._buffers.push(e);}else (r instanceof qa||r instanceof ja)&&r.paintVertexBuffer&&this._buffers.push(r.paintVertexBuffer);}}upload(t){for(const e in this.binders){const r=this.binders[e];(r instanceof qa||r instanceof ja||r instanceof Na)&&r.upload(t);}this.updatePaintBuffers();}destroy(){for(const t in this.binders){const e=this.binders[t];(e instanceof qa||e instanceof ja||e instanceof Na)&&e.destroy();}}}class Ka{constructor(t,e,r=(()=>!0)){this.programConfigurations={};for(const n of t)this.programConfigurations[n.id]=new Za(n,e,r);this.needsUpload=!1,this._featureMap=new Ba,this._bufferOffset=0;}populatePaintArrays(t,e,r,n,i,a){for(const r in this.programConfigurations)this.programConfigurations[r].populatePaintArrays(t,e,n,i,a);void 0!==e.id&&this._featureMap.add(e.id,r,this._bufferOffset,t),this._bufferOffset=t,this.needsUpload=!0;}updatePaintArrays(t,e,r,n){for(const i of r)this.needsUpload=this.programConfigurations[i.id].updatePaintArrays(t,this._featureMap,e,i,n)||this.needsUpload;}get(t){return this.programConfigurations[t]}upload(t){if(this.needsUpload){for(const e in this.programConfigurations)this.programConfigurations[e].upload(t);this.needsUpload=!1;}}destroy(){for(const t in this.programConfigurations)this.programConfigurations[t].destroy();}}function Ga(t,e){return {"text-opacity":["opacity"],"icon-opacity":["opacity"],"text-color":["fill_color"],"icon-color":["fill_color"],"text-halo-color":["halo_color"],"icon-halo-color":["halo_color"],"text-halo-blur":["halo_blur"],"icon-halo-blur":["halo_blur"],"text-halo-width":["halo_width"],"icon-halo-width":["halo_width"],"line-gap-width":["gapwidth"],"line-pattern":["pattern_to","pattern_from","pixel_ratio_to","pixel_ratio_from"],"fill-pattern":["pattern_to","pattern_from","pixel_ratio_to","pixel_ratio_from"],"fill-extrusion-pattern":["pattern_to","pattern_from","pixel_ratio_to","pixel_ratio_from"]}[t]||[t.replace(`${e}-`,"").replace(/-/g,"_")]}function Ja(t,e,r){const n={color:{source:Mi,composite:Zi},number:{source:Ui,composite:Mi}},i=function(t){return {"line-pattern":{source:ca,composite:ca},"fill-pattern":{source:ca,composite:ca},"fill-extrusion-pattern":{source:ca,composite:ca}}[t]}(t);return i&&i[r]||n[e][r]}Pn("ConstantBinder",Ua),Pn("CrossFadedConstantBinder",Ra),Pn("SourceExpressionBinder",qa),Pn("CrossFadedCompositeBinder",Na),Pn("CompositeExpressionBinder",ja),Pn("ProgramConfiguration",Za,{omit:["_buffers"]}),Pn("ProgramConfigurationSet",Ka);const Xa=8192,Ya=Math.pow(2,14)-1,Ha=-Ya-1;function Wa(t){const e=Xa/t.extent,r=t.loadGeometry();for(let t=0;t<r.length;t++){const n=r[t];for(let t=0;t<n.length;t++){const r=n[t],i=Math.round(r.x*e),a=Math.round(r.y*e);r.x=c(i,Ha,Ya),r.y=c(a,Ha,Ya),(i<r.x||i>r.x+1||a<r.y||a>r.y+1)&&x("Geometry exceeds allowed extent, reduce your vector tile buffer size");}}return r}function Qa(t,e){return {type:t.type,id:t.id,properties:t.properties,geometry:e?Wa(t):[]}}function ts(t,e,r,n,i){t.emplaceBack(2*e+(n+1)/2,2*r+(i+1)/2);}class es{constructor(t){this.zoom=t.zoom,this.overscaling=t.overscaling,this.layers=t.layers,this.layerIds=this.layers.map((t=>t.id)),this.index=t.index,this.hasPattern=!1,this.layoutVertexArray=new aa,this.indexArray=new ma,this.segments=new ba,this.programConfigurations=new Ka(t.layers,t.zoom),this.stateDependentLayerIds=this.layers.filter((t=>t.isStateDependent())).map((t=>t.id));}populate(t,e,r){const n=this.layers[0],i=[];let a=null,s=!1;"circle"===n.type&&(a=n.layout.get("circle-sort-key"),s=!a.isConstant());for(const{feature:e,id:n,index:o,sourceLayerIndex:l}of t){const t=this.layers[0]._featureFilter.needGeometry,u=Qa(e,t);if(!this.layers[0]._featureFilter.filter(new ei(this.zoom),u,r))continue;const c=s?a.evaluate(u,{},r):void 0,h={id:n,properties:e.properties,type:e.type,sourceLayerIndex:l,index:o,geometry:t?u.geometry:Wa(e),patterns:{},sortKey:c};i.push(h);}s&&i.sort(((t,e)=>t.sortKey-e.sortKey));for(const n of i){const{geometry:i,index:a,sourceLayerIndex:s}=n,o=t[a].feature;this.addFeature(n,i,a,r),e.featureIndex.insert(o,i,a,s,this.index);}}update(t,e,r){this.stateDependentLayers.length&&this.programConfigurations.updatePaintArrays(t,e,this.stateDependentLayers,r);}isEmpty(){return 0===this.layoutVertexArray.length}uploadPending(){return !this.uploaded||this.programConfigurations.needsUpload}upload(t){this.uploaded||(this.layoutVertexBuffer=t.createVertexBuffer(this.layoutVertexArray,va),this.indexBuffer=t.createIndexBuffer(this.indexArray)),this.programConfigurations.upload(t),this.uploaded=!0;}destroy(){this.layoutVertexBuffer&&(this.layoutVertexBuffer.destroy(),this.indexBuffer.destroy(),this.programConfigurations.destroy(),this.segments.destroy());}addFeature(t,e,r,n){for(const r of e)for(const e of r){const r=e.x,n=e.y;if(r<0||r>=Xa||n<0||n>=Xa)continue;const i=this.segments.prepareSegment(4,this.layoutVertexArray,this.indexArray,t.sortKey),a=i.vertexLength;ts(this.layoutVertexArray,r,n,-1,-1),ts(this.layoutVertexArray,r,n,1,-1),ts(this.layoutVertexArray,r,n,1,1),ts(this.layoutVertexArray,r,n,-1,1),this.indexArray.emplaceBack(a,a+1,a+2),this.indexArray.emplaceBack(a,a+3,a+2),i.vertexLength+=4,i.primitiveLength+=2;}this.programConfigurations.populatePaintArrays(this.layoutVertexArray.length,t,r,{},n);}}function rs(t,e){for(let r=0;r<t.length;r++)if(hs(e,t[r]))return !0;for(let r=0;r<e.length;r++)if(hs(t,e[r]))return !0;return !!ss(t,e)}function ns(t,e,r){return !!hs(t,e)||!!ls(e,t,r)}function is(t,e){if(1===t.length)return cs(e,t[0]);for(let r=0;r<e.length;r++){const n=e[r];for(let e=0;e<n.length;e++)if(hs(t,n[e]))return !0}for(let r=0;r<t.length;r++)if(cs(e,t[r]))return !0;for(let r=0;r<e.length;r++)if(ss(t,e[r]))return !0;return !1}function as(t,e,r){if(t.length>1){if(ss(t,e))return !0;for(let n=0;n<e.length;n++)if(ls(e[n],t,r))return !0}for(let n=0;n<t.length;n++)if(ls(t[n],e,r))return !0;return !1}function ss(t,e){if(0===t.length||0===e.length)return !1;for(let r=0;r<t.length-1;r++){const n=t[r],i=t[r+1];for(let t=0;t<e.length-1;t++)if(os(n,i,e[t],e[t+1]))return !0}return !1}function os(t,e,r,n){return v(t,r,n)!==v(e,r,n)&&v(t,e,r)!==v(t,e,n)}function ls(t,e,r){const n=r*r;if(1===e.length)return t.distSqr(e[0])<n;for(let r=1;r<e.length;r++)if(us(t,e[r-1],e[r])<n)return !0;return !1}function us(t,e,r){const n=e.distSqr(r);if(0===n)return t.distSqr(e);const i=((t.x-e.x)*(r.x-e.x)+(t.y-e.y)*(r.y-e.y))/n;return t.distSqr(i<0?e:i>1?r:r.sub(e)._mult(i)._add(e))}function cs(t,e){let r,n,i,a=!1;for(let s=0;s<t.length;s++){r=t[s];for(let t=0,s=r.length-1;t<r.length;s=t++)n=r[t],i=r[s],n.y>e.y!=i.y>e.y&&e.x<(i.x-n.x)*(e.y-n.y)/(i.y-n.y)+n.x&&(a=!a);}return a}function hs(t,e){let r=!1;for(let n=0,i=t.length-1;n<t.length;i=n++){const a=t[n],s=t[i];a.y>e.y!=s.y>e.y&&e.x<(s.x-a.x)*(e.y-a.y)/(s.y-a.y)+a.x&&(r=!r);}return r}function ps(t,e,r){const n=r[0],i=r[2];if(t.x<n.x&&e.x<n.x||t.x>i.x&&e.x>i.x||t.y<n.y&&e.y<n.y||t.y>i.y&&e.y>i.y)return !1;const a=v(t,e,r[0]);return a!==v(t,e,r[1])||a!==v(t,e,r[2])||a!==v(t,e,r[3])}function fs(t,e,r){const n=e.paint.get(t).value;return "constant"===n.kind?n.value:r.programConfigurations.get(e.id).getMaxValue(t)}function ds(t){return Math.sqrt(t[0]*t[0]+t[1]*t[1])}function ys(t,e,r,n,a){if(!e[0]&&!e[1])return t;const s=i.convert(e)._mult(a);"viewport"===r&&s._rotate(-n);const o=[];for(let e=0;e<t.length;e++)o.push(t[e].sub(s));return o}let ms,gs;Pn("CircleBucket",es,{omit:["layers"]});var xs={get paint(){return gs=gs||new yi({"circle-radius":new hi(q.paint_circle["circle-radius"]),"circle-color":new hi(q.paint_circle["circle-color"]),"circle-blur":new hi(q.paint_circle["circle-blur"]),"circle-opacity":new hi(q.paint_circle["circle-opacity"]),"circle-translate":new ci(q.paint_circle["circle-translate"]),"circle-translate-anchor":new ci(q.paint_circle["circle-translate-anchor"]),"circle-pitch-scale":new ci(q.paint_circle["circle-pitch-scale"]),"circle-pitch-alignment":new ci(q.paint_circle["circle-pitch-alignment"]),"circle-stroke-width":new hi(q.paint_circle["circle-stroke-width"]),"circle-stroke-color":new hi(q.paint_circle["circle-stroke-color"]),"circle-stroke-opacity":new hi(q.paint_circle["circle-stroke-opacity"])})},get layout(){return ms=ms||new yi({"circle-sort-key":new hi(q.layout_circle["circle-sort-key"])})}},vs=1e-6,bs="undefined"!=typeof Float32Array?Float32Array:Array;function ws(t){return t[0]=1,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=1,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[10]=1,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,t}function _s(t,e,r){var n=e[0],i=e[1],a=e[2],s=e[3],o=e[4],l=e[5],u=e[6],c=e[7],h=e[8],p=e[9],f=e[10],d=e[11],y=e[12],m=e[13],g=e[14],x=e[15],v=r[0],b=r[1],w=r[2],_=r[3];return t[0]=v*n+b*o+w*h+_*y,t[1]=v*i+b*l+w*p+_*m,t[2]=v*a+b*u+w*f+_*g,t[3]=v*s+b*c+w*d+_*x,t[4]=(v=r[4])*n+(b=r[5])*o+(w=r[6])*h+(_=r[7])*y,t[5]=v*i+b*l+w*p+_*m,t[6]=v*a+b*u+w*f+_*g,t[7]=v*s+b*c+w*d+_*x,t[8]=(v=r[8])*n+(b=r[9])*o+(w=r[10])*h+(_=r[11])*y,t[9]=v*i+b*l+w*p+_*m,t[10]=v*a+b*u+w*f+_*g,t[11]=v*s+b*c+w*d+_*x,t[12]=(v=r[12])*n+(b=r[13])*o+(w=r[14])*h+(_=r[15])*y,t[13]=v*i+b*l+w*p+_*m,t[14]=v*a+b*u+w*f+_*g,t[15]=v*s+b*c+w*d+_*x,t}Math.hypot||(Math.hypot=function(){for(var t=0,e=arguments.length;e--;)t+=arguments[e]*arguments[e];return Math.sqrt(t)});var As,Ss=_s;function ks(t,e,r){var n=e[0],i=e[1],a=e[2],s=e[3];return t[0]=r[0]*n+r[4]*i+r[8]*a+r[12]*s,t[1]=r[1]*n+r[5]*i+r[9]*a+r[13]*s,t[2]=r[2]*n+r[6]*i+r[10]*a+r[14]*s,t[3]=r[3]*n+r[7]*i+r[11]*a+r[15]*s,t}As=new bs(4),bs!=Float32Array&&(As[0]=0,As[1]=0,As[2]=0,As[3]=0);class Is extends gi{constructor(t){super(t,xs);}createBucket(t){return new es(t)}queryRadius(t){const e=t;return fs("circle-radius",this,e)+fs("circle-stroke-width",this,e)+ds(this.paint.get("circle-translate"))}queryIntersectsFeature(t,e,r,n,i,a,s,o){const l=ys(t,this.paint.get("circle-translate"),this.paint.get("circle-translate-anchor"),a.angle,s),u=this.paint.get("circle-radius").evaluate(e,r)+this.paint.get("circle-stroke-width").evaluate(e,r),c="map"===this.paint.get("circle-pitch-alignment"),h=c?l:function(t,e){return t.map((t=>zs(t,e)))}(l,o),p=c?u*s:u;for(const t of n)for(const e of t){const t=c?e:zs(e,o);let r=p;const n=ks([],[e.x,e.y,0,1],o);if("viewport"===this.paint.get("circle-pitch-scale")&&"map"===this.paint.get("circle-pitch-alignment")?r*=n[3]/a.cameraToCenterDistance:"map"===this.paint.get("circle-pitch-scale")&&"viewport"===this.paint.get("circle-pitch-alignment")&&(r*=a.cameraToCenterDistance/n[3]),ns(h,t,r))return !0}return !1}}function zs(t,e){const r=ks([],[t.x,t.y,0,1],e);return new i(r[0]/r[3],r[1]/r[3])}class Ms extends es{}let Ps;Pn("HeatmapBucket",Ms,{omit:["layers"]});var Bs={get paint(){return Ps=Ps||new yi({"heatmap-radius":new hi(q.paint_heatmap["heatmap-radius"]),"heatmap-weight":new hi(q.paint_heatmap["heatmap-weight"]),"heatmap-intensity":new ci(q.paint_heatmap["heatmap-intensity"]),"heatmap-color":new di(q.paint_heatmap["heatmap-color"]),"heatmap-opacity":new ci(q.paint_heatmap["heatmap-opacity"])})}};function Cs(t,{width:e,height:r},n,i){if(i){if(i instanceof Uint8ClampedArray)i=new Uint8Array(i.buffer);else if(i.length!==e*r*n)throw new RangeError(`mismatched image size. expected: ${i.length} but got: ${e*r*n}`)}else i=new Uint8Array(e*r*n);return t.width=e,t.height=r,t.data=i,t}function Vs(t,{width:e,height:r},n){if(e===t.width&&r===t.height)return;const i=Cs({},{width:e,height:r},n);Es(t,i,{x:0,y:0},{x:0,y:0},{width:Math.min(t.width,e),height:Math.min(t.height,r)},n),t.width=e,t.height=r,t.data=i.data;}function Es(t,e,r,n,i,a){if(0===i.width||0===i.height)return e;if(i.width>t.width||i.height>t.height||r.x>t.width-i.width||r.y>t.height-i.height)throw new RangeError("out of range source coordinates for image copy");if(i.width>e.width||i.height>e.height||n.x>e.width-i.width||n.y>e.height-i.height)throw new RangeError("out of range destination coordinates for image copy");const s=t.data,o=e.data;if(s===o)throw new Error("srcData equals dstData, so image is already copied");for(let l=0;l<i.height;l++){const u=((r.y+l)*t.width+r.x)*a,c=((n.y+l)*e.width+n.x)*a;for(let t=0;t<i.width*a;t++)o[c+t]=s[u+t];}return e}class Ts{constructor(t,e){Cs(this,t,1,e);}resize(t){Vs(this,t,1);}clone(){return new Ts({width:this.width,height:this.height},new Uint8Array(this.data))}static copy(t,e,r,n,i){Es(t,e,r,n,i,1);}}class Fs{constructor(t,e){Cs(this,t,4,e);}resize(t){Vs(this,t,4);}replace(t,e){e?this.data.set(t):this.data=t instanceof Uint8ClampedArray?new Uint8Array(t.buffer):t;}clone(){return new Fs({width:this.width,height:this.height},new Uint8Array(this.data))}static copy(t,e,r,n,i){Es(t,e,r,n,i,4);}}function Ls(t){const e={},r=t.resolution||256,n=t.clips?t.clips.length:1,i=t.image||new Fs({width:r,height:n});if(Math.log(r)/Math.LN2%1!=0)throw new Error(`width is not a power of 2 - ${r}`);const a=(r,n,a)=>{e[t.evaluationKey]=a;const s=t.expression.evaluate(e);i.data[r+n+0]=Math.floor(255*s.r/s.a),i.data[r+n+1]=Math.floor(255*s.g/s.a),i.data[r+n+2]=Math.floor(255*s.b/s.a),i.data[r+n+3]=Math.floor(255*s.a);};if(t.clips)for(let e=0,i=0;e<n;++e,i+=4*r)for(let n=0,s=0;n<r;n++,s+=4){const o=n/(r-1),{start:l,end:u}=t.clips[e];a(i,s,l*(1-o)+u*o);}else for(let t=0,e=0;t<r;t++,e+=4)a(0,e,t/(r-1));return i}Pn("AlphaImage",Ts),Pn("RGBAImage",Fs);class $s extends gi{createBucket(t){return new Ms(t)}constructor(t){super(t,Bs),this._updateColorRamp();}_handleSpecialPaintPropertyUpdate(t){"heatmap-color"===t&&this._updateColorRamp();}_updateColorRamp(){this.colorRamp=Ls({expression:this._transitionablePaint._values["heatmap-color"].value.expression,evaluationKey:"heatmapDensity",image:this.colorRamp}),this.colorRampTexture=null;}resize(){this.heatmapFbo&&(this.heatmapFbo.destroy(),this.heatmapFbo=null);}queryRadius(){return 0}queryIntersectsFeature(){return !1}hasOffscreenPass(){return 0!==this.paint.get("heatmap-opacity")&&"none"!==this.visibility}}let Ds;var Os={get paint(){return Ds=Ds||new yi({"hillshade-illumination-direction":new ci(q.paint_hillshade["hillshade-illumination-direction"]),"hillshade-illumination-anchor":new ci(q.paint_hillshade["hillshade-illumination-anchor"]),"hillshade-exaggeration":new ci(q.paint_hillshade["hillshade-exaggeration"]),"hillshade-shadow-color":new ci(q.paint_hillshade["hillshade-shadow-color"]),"hillshade-highlight-color":new ci(q.paint_hillshade["hillshade-highlight-color"]),"hillshade-accent-color":new ci(q.paint_hillshade["hillshade-accent-color"])})}};class Us extends gi{constructor(t){super(t,Os);}hasOffscreenPass(){return 0!==this.paint.get("hillshade-exaggeration")&&"none"!==this.visibility}}const Rs=wi([{name:"a_pos",components:2,type:"Int16"}],4),{members:qs}=Rs;var js={exports:{}};function Ns(t,e,r){r=r||2;var n,i,a,s,o,l,u,c=e&&e.length,h=c?e[0]*r:t.length,p=Zs(t,0,h,r,!0),f=[];if(!p||p.next===p.prev)return f;if(c&&(p=function(t,e,r,n){var i,a,s,o=[];for(i=0,a=e.length;i<a;i++)(s=Zs(t,e[i]*n,i<a-1?e[i+1]*n:t.length,n,!1))===s.next&&(s.steiner=!0),o.push(ro(s));for(o.sort(Ws),i=0;i<o.length;i++)r=Qs(o[i],r);return r}(t,e,p,r)),t.length>80*r){n=a=t[0],i=s=t[1];for(var d=r;d<h;d+=r)(o=t[d])<n&&(n=o),(l=t[d+1])<i&&(i=l),o>a&&(a=o),l>s&&(s=l);u=0!==(u=Math.max(a-n,s-i))?32767/u:0;}return Gs(p,f,r,n,i,u,0),f}function Zs(t,e,r,n,i){var a,s;if(i===mo(t,e,r,n)>0)for(a=e;a<r;a+=n)s=po(a,t[a],t[a+1],s);else for(a=r-n;a>=e;a-=n)s=po(a,t[a],t[a+1],s);return s&&so(s,s.next)&&(fo(s),s=s.next),s}function Ks(t,e){if(!t)return t;e||(e=t);var r,n=t;do{if(r=!1,n.steiner||!so(n,n.next)&&0!==ao(n.prev,n,n.next))n=n.next;else {if(fo(n),(n=e=n.prev)===n.next)break;r=!0;}}while(r||n!==e);return e}function Gs(t,e,r,n,i,a,s){if(t){!s&&a&&function(t,e,r,n){var i=t;do{0===i.z&&(i.z=eo(i.x,i.y,e,r,n)),i.prevZ=i.prev,i.nextZ=i.next,i=i.next;}while(i!==t);i.prevZ.nextZ=null,i.prevZ=null,function(t){var e,r,n,i,a,s,o,l,u=1;do{for(r=t,t=null,a=null,s=0;r;){for(s++,n=r,o=0,e=0;e<u&&(o++,n=n.nextZ);e++);for(l=u;o>0||l>0&&n;)0!==o&&(0===l||!n||r.z<=n.z)?(i=r,r=r.nextZ,o--):(i=n,n=n.nextZ,l--),a?a.nextZ=i:t=i,i.prevZ=a,a=i;r=n;}a.nextZ=null,u*=2;}while(s>1)}(i);}(t,n,i,a);for(var o,l,u=t;t.prev!==t.next;)if(o=t.prev,l=t.next,a?Xs(t,n,i,a):Js(t))e.push(o.i/r|0),e.push(t.i/r|0),e.push(l.i/r|0),fo(t),t=l.next,u=l.next;else if((t=l)===u){s?1===s?Gs(t=Ys(Ks(t),e,r),e,r,n,i,a,2):2===s&&Hs(t,e,r,n,i,a):Gs(Ks(t),e,r,n,i,a,1);break}}}function Js(t){var e=t.prev,r=t,n=t.next;if(ao(e,r,n)>=0)return !1;for(var i=e.x,a=r.x,s=n.x,o=e.y,l=r.y,u=n.y,c=i<a?i<s?i:s:a<s?a:s,h=o<l?o<u?o:u:l<u?l:u,p=i>a?i>s?i:s:a>s?a:s,f=o>l?o>u?o:u:l>u?l:u,d=n.next;d!==e;){if(d.x>=c&&d.x<=p&&d.y>=h&&d.y<=f&&no(i,o,a,l,s,u,d.x,d.y)&&ao(d.prev,d,d.next)>=0)return !1;d=d.next;}return !0}function Xs(t,e,r,n){var i=t.prev,a=t,s=t.next;if(ao(i,a,s)>=0)return !1;for(var o=i.x,l=a.x,u=s.x,c=i.y,h=a.y,p=s.y,f=o<l?o<u?o:u:l<u?l:u,d=c<h?c<p?c:p:h<p?h:p,y=o>l?o>u?o:u:l>u?l:u,m=c>h?c>p?c:p:h>p?h:p,g=eo(f,d,e,r,n),x=eo(y,m,e,r,n),v=t.prevZ,b=t.nextZ;v&&v.z>=g&&b&&b.z<=x;){if(v.x>=f&&v.x<=y&&v.y>=d&&v.y<=m&&v!==i&&v!==s&&no(o,c,l,h,u,p,v.x,v.y)&&ao(v.prev,v,v.next)>=0)return !1;if(v=v.prevZ,b.x>=f&&b.x<=y&&b.y>=d&&b.y<=m&&b!==i&&b!==s&&no(o,c,l,h,u,p,b.x,b.y)&&ao(b.prev,b,b.next)>=0)return !1;b=b.nextZ;}for(;v&&v.z>=g;){if(v.x>=f&&v.x<=y&&v.y>=d&&v.y<=m&&v!==i&&v!==s&&no(o,c,l,h,u,p,v.x,v.y)&&ao(v.prev,v,v.next)>=0)return !1;v=v.prevZ;}for(;b&&b.z<=x;){if(b.x>=f&&b.x<=y&&b.y>=d&&b.y<=m&&b!==i&&b!==s&&no(o,c,l,h,u,p,b.x,b.y)&&ao(b.prev,b,b.next)>=0)return !1;b=b.nextZ;}return !0}function Ys(t,e,r){var n=t;do{var i=n.prev,a=n.next.next;!so(i,a)&&oo(i,n,n.next,a)&&co(i,a)&&co(a,i)&&(e.push(i.i/r|0),e.push(n.i/r|0),e.push(a.i/r|0),fo(n),fo(n.next),n=t=a),n=n.next;}while(n!==t);return Ks(n)}function Hs(t,e,r,n,i,a){var s=t;do{for(var o=s.next.next;o!==s.prev;){if(s.i!==o.i&&io(s,o)){var l=ho(s,o);return s=Ks(s,s.next),l=Ks(l,l.next),Gs(s,e,r,n,i,a,0),void Gs(l,e,r,n,i,a,0)}o=o.next;}s=s.next;}while(s!==t)}function Ws(t,e){return t.x-e.x}function Qs(t,e){var r=function(t,e){var r,n=e,i=t.x,a=t.y,s=-1/0;do{if(a<=n.y&&a>=n.next.y&&n.next.y!==n.y){var o=n.x+(a-n.y)*(n.next.x-n.x)/(n.next.y-n.y);if(o<=i&&o>s&&(s=o,r=n.x<n.next.x?n:n.next,o===i))return r}n=n.next;}while(n!==e);if(!r)return null;var l,u=r,c=r.x,h=r.y,p=1/0;n=r;do{i>=n.x&&n.x>=c&&i!==n.x&&no(a<h?i:s,a,c,h,a<h?s:i,a,n.x,n.y)&&(l=Math.abs(a-n.y)/(i-n.x),co(n,t)&&(l<p||l===p&&(n.x>r.x||n.x===r.x&&to(r,n)))&&(r=n,p=l)),n=n.next;}while(n!==u);return r}(t,e);if(!r)return e;var n=ho(r,t);return Ks(n,n.next),Ks(r,r.next)}function to(t,e){return ao(t.prev,t,e.prev)<0&&ao(e.next,t,t.next)<0}function eo(t,e,r,n,i){return (t=1431655765&((t=858993459&((t=252645135&((t=16711935&((t=(t-r)*i|0)|t<<8))|t<<4))|t<<2))|t<<1))|(e=1431655765&((e=858993459&((e=252645135&((e=16711935&((e=(e-n)*i|0)|e<<8))|e<<4))|e<<2))|e<<1))<<1}function ro(t){var e=t,r=t;do{(e.x<r.x||e.x===r.x&&e.y<r.y)&&(r=e),e=e.next;}while(e!==t);return r}function no(t,e,r,n,i,a,s,o){return (i-s)*(e-o)>=(t-s)*(a-o)&&(t-s)*(n-o)>=(r-s)*(e-o)&&(r-s)*(a-o)>=(i-s)*(n-o)}function io(t,e){return t.next.i!==e.i&&t.prev.i!==e.i&&!function(t,e){var r=t;do{if(r.i!==t.i&&r.next.i!==t.i&&r.i!==e.i&&r.next.i!==e.i&&oo(r,r.next,t,e))return !0;r=r.next;}while(r!==t);return !1}(t,e)&&(co(t,e)&&co(e,t)&&function(t,e){var r=t,n=!1,i=(t.x+e.x)/2,a=(t.y+e.y)/2;do{r.y>a!=r.next.y>a&&r.next.y!==r.y&&i<(r.next.x-r.x)*(a-r.y)/(r.next.y-r.y)+r.x&&(n=!n),r=r.next;}while(r!==t);return n}(t,e)&&(ao(t.prev,t,e.prev)||ao(t,e.prev,e))||so(t,e)&&ao(t.prev,t,t.next)>0&&ao(e.prev,e,e.next)>0)}function ao(t,e,r){return (e.y-t.y)*(r.x-e.x)-(e.x-t.x)*(r.y-e.y)}function so(t,e){return t.x===e.x&&t.y===e.y}function oo(t,e,r,n){var i=uo(ao(t,e,r)),a=uo(ao(t,e,n)),s=uo(ao(r,n,t)),o=uo(ao(r,n,e));return i!==a&&s!==o||!(0!==i||!lo(t,r,e))||!(0!==a||!lo(t,n,e))||!(0!==s||!lo(r,t,n))||!(0!==o||!lo(r,e,n))}function lo(t,e,r){return e.x<=Math.max(t.x,r.x)&&e.x>=Math.min(t.x,r.x)&&e.y<=Math.max(t.y,r.y)&&e.y>=Math.min(t.y,r.y)}function uo(t){return t>0?1:t<0?-1:0}function co(t,e){return ao(t.prev,t,t.next)<0?ao(t,e,t.next)>=0&&ao(t,t.prev,e)>=0:ao(t,e,t.prev)<0||ao(t,t.next,e)<0}function ho(t,e){var r=new yo(t.i,t.x,t.y),n=new yo(e.i,e.x,e.y),i=t.next,a=e.prev;return t.next=e,e.prev=t,r.next=i,i.prev=r,n.next=r,r.prev=n,a.next=n,n.prev=a,n}function po(t,e,r,n){var i=new yo(t,e,r);return n?(i.next=n.next,i.prev=n,n.next.prev=i,n.next=i):(i.prev=i,i.next=i),i}function fo(t){t.next.prev=t.prev,t.prev.next=t.next,t.prevZ&&(t.prevZ.nextZ=t.nextZ),t.nextZ&&(t.nextZ.prevZ=t.prevZ);}function yo(t,e,r){this.i=t,this.x=e,this.y=r,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1;}function mo(t,e,r,n){for(var i=0,a=e,s=r-n;a<r;a+=n)i+=(t[s]-t[a])*(t[a+1]+t[s+1]),s=a;return i}js.exports=Ns,js.exports.default=Ns,Ns.deviation=function(t,e,r,n){var i=e&&e.length,a=Math.abs(mo(t,0,i?e[0]*r:t.length,r));if(i)for(var s=0,o=e.length;s<o;s++)a-=Math.abs(mo(t,e[s]*r,s<o-1?e[s+1]*r:t.length,r));var l=0;for(s=0;s<n.length;s+=3){var u=n[s]*r,c=n[s+1]*r,h=n[s+2]*r;l+=Math.abs((t[u]-t[h])*(t[c+1]-t[u+1])-(t[u]-t[c])*(t[h+1]-t[u+1]));}return 0===a&&0===l?0:Math.abs((l-a)/a)},Ns.flatten=function(t){for(var e=t[0][0].length,r={vertices:[],holes:[],dimensions:e},n=0,i=0;i<t.length;i++){for(var a=0;a<t[i].length;a++)for(var s=0;s<e;s++)r.vertices.push(t[i][a][s]);i>0&&r.holes.push(n+=t[i-1].length);}return r};var go=e(js.exports);function xo(t,e,r,n,i){vo(t,e,r||0,n||t.length-1,i||wo);}function vo(t,e,r,n,i){for(;n>r;){if(n-r>600){var a=n-r+1,s=e-r+1,o=Math.log(a),l=.5*Math.exp(2*o/3),u=.5*Math.sqrt(o*l*(a-l)/a)*(s-a/2<0?-1:1);vo(t,e,Math.max(r,Math.floor(e-s*l/a+u)),Math.min(n,Math.floor(e+(a-s)*l/a+u)),i);}var c=t[e],h=r,p=n;for(bo(t,r,e),i(t[n],c)>0&&bo(t,r,n);h<p;){for(bo(t,h,p),h++,p--;i(t[h],c)<0;)h++;for(;i(t[p],c)>0;)p--;}0===i(t[r],c)?bo(t,r,p):bo(t,++p,n),p<=e&&(r=p+1),e<=p&&(n=p-1);}}function bo(t,e,r){var n=t[e];t[e]=t[r],t[r]=n;}function wo(t,e){return t<e?-1:t>e?1:0}function _o(t,e){const r=t.length;if(r<=1)return [t];const n=[];let i,a;for(let e=0;e<r;e++){const r=b(t[e]);0!==r&&(t[e].area=Math.abs(r),void 0===a&&(a=r<0),a===r<0?(i&&n.push(i),i=[t[e]]):i.push(t[e]));}if(i&&n.push(i),e>1)for(let t=0;t<n.length;t++)n[t].length<=e||(xo(n[t],e,1,n[t].length-1,Ao),n[t]=n[t].slice(0,e));return n}function Ao(t,e){return e.area-t.area}function So(t,e,r){const n=r.patternDependencies;let i=!1;for(const r of e){const e=r.paint.get(`${t}-pattern`);e.isConstant()||(i=!0);const a=e.constantOr(null);a&&(i=!0,n[a.to]=!0,n[a.from]=!0);}return i}function ko(t,e,r,n,i){const a=i.patternDependencies;for(const s of e){const e=s.paint.get(`${t}-pattern`).value;if("constant"!==e.kind){let t=e.evaluate({zoom:n-1},r,{},i.availableImages),o=e.evaluate({zoom:n},r,{},i.availableImages),l=e.evaluate({zoom:n+1},r,{},i.availableImages);t=t&&t.name?t.name:t,o=o&&o.name?o.name:o,l=l&&l.name?l.name:l,a[t]=!0,a[o]=!0,a[l]=!0,r.patterns[s.id]={min:t,mid:o,max:l};}}return r}class Io{constructor(t){this.zoom=t.zoom,this.overscaling=t.overscaling,this.layers=t.layers,this.layerIds=this.layers.map((t=>t.id)),this.index=t.index,this.hasPattern=!1,this.patternFeatures=[],this.layoutVertexArray=new sa,this.indexArray=new ma,this.indexArray2=new ga,this.programConfigurations=new Ka(t.layers,t.zoom),this.segments=new ba,this.segments2=new ba,this.stateDependentLayerIds=this.layers.filter((t=>t.isStateDependent())).map((t=>t.id));}populate(t,e,r){this.hasPattern=So("fill",this.layers,e);const n=this.layers[0].layout.get("fill-sort-key"),i=!n.isConstant(),a=[];for(const{feature:s,id:o,index:l,sourceLayerIndex:u}of t){const t=this.layers[0]._featureFilter.needGeometry,c=Qa(s,t);if(!this.layers[0]._featureFilter.filter(new ei(this.zoom),c,r))continue;const h=i?n.evaluate(c,{},r,e.availableImages):void 0,p={id:o,properties:s.properties,type:s.type,sourceLayerIndex:u,index:l,geometry:t?c.geometry:Wa(s),patterns:{},sortKey:h};a.push(p);}i&&a.sort(((t,e)=>t.sortKey-e.sortKey));for(const n of a){const{geometry:i,index:a,sourceLayerIndex:s}=n;if(this.hasPattern){const t=ko("fill",this.layers,n,this.zoom,e);this.patternFeatures.push(t);}else this.addFeature(n,i,a,r,{});e.featureIndex.insert(t[a].feature,i,a,s,this.index);}}update(t,e,r){this.stateDependentLayers.length&&this.programConfigurations.updatePaintArrays(t,e,this.stateDependentLayers,r);}addFeatures(t,e,r){for(const t of this.patternFeatures)this.addFeature(t,t.geometry,t.index,e,r);}isEmpty(){return 0===this.layoutVertexArray.length}uploadPending(){return !this.uploaded||this.programConfigurations.needsUpload}upload(t){this.uploaded||(this.layoutVertexBuffer=t.createVertexBuffer(this.layoutVertexArray,qs),this.indexBuffer=t.createIndexBuffer(this.indexArray),this.indexBuffer2=t.createIndexBuffer(this.indexArray2)),this.programConfigurations.upload(t),this.uploaded=!0;}destroy(){this.layoutVertexBuffer&&(this.layoutVertexBuffer.destroy(),this.indexBuffer.destroy(),this.indexBuffer2.destroy(),this.programConfigurations.destroy(),this.segments.destroy(),this.segments2.destroy());}addFeature(t,e,r,n,i){for(const t of _o(e,500)){let e=0;for(const r of t)e+=r.length;const r=this.segments.prepareSegment(e,this.layoutVertexArray,this.indexArray),n=r.vertexLength,i=[],a=[];for(const e of t){if(0===e.length)continue;e!==t[0]&&a.push(i.length/2);const r=this.segments2.prepareSegment(e.length,this.layoutVertexArray,this.indexArray2),n=r.vertexLength;this.layoutVertexArray.emplaceBack(e[0].x,e[0].y),this.indexArray2.emplaceBack(n+e.length-1,n),i.push(e[0].x),i.push(e[0].y);for(let t=1;t<e.length;t++)this.layoutVertexArray.emplaceBack(e[t].x,e[t].y),this.indexArray2.emplaceBack(n+t-1,n+t),i.push(e[t].x),i.push(e[t].y);r.vertexLength+=e.length,r.primitiveLength+=e.length;}const s=go(i,a);for(let t=0;t<s.length;t+=3)this.indexArray.emplaceBack(n+s[t],n+s[t+1],n+s[t+2]);r.vertexLength+=e,r.primitiveLength+=s.length/3;}this.programConfigurations.populatePaintArrays(this.layoutVertexArray.length,t,r,i,n);}}let zo,Mo;Pn("FillBucket",Io,{omit:["layers","patternFeatures"]});var Po={get paint(){return Mo=Mo||new yi({"fill-antialias":new ci(q.paint_fill["fill-antialias"]),"fill-opacity":new hi(q.paint_fill["fill-opacity"]),"fill-color":new hi(q.paint_fill["fill-color"]),"fill-outline-color":new hi(q.paint_fill["fill-outline-color"]),"fill-translate":new ci(q.paint_fill["fill-translate"]),"fill-translate-anchor":new ci(q.paint_fill["fill-translate-anchor"]),"fill-pattern":new pi(q.paint_fill["fill-pattern"])})},get layout(){return zo=zo||new yi({"fill-sort-key":new hi(q.layout_fill["fill-sort-key"])})}};class Bo extends gi{constructor(t){super(t,Po);}recalculate(t,e){super.recalculate(t,e);const r=this.paint._values["fill-outline-color"];"constant"===r.value.kind&&void 0===r.value.value&&(this.paint._values["fill-outline-color"]=this.paint._values["fill-color"]);}createBucket(t){return new Io(t)}queryRadius(){return ds(this.paint.get("fill-translate"))}queryIntersectsFeature(t,e,r,n,i,a,s){return is(ys(t,this.paint.get("fill-translate"),this.paint.get("fill-translate-anchor"),a.angle,s),n)}isTileClipped(){return !0}}const Co=wi([{name:"a_pos",components:2,type:"Int16"},{name:"a_normal_ed",components:4,type:"Int16"}],4),Vo=wi([{name:"a_centroid",components:2,type:"Int16"}],4),{members:Eo}=Co;var To={},Fo=r,Lo=$o;function $o(t,e,r,n,i){this.properties={},this.extent=r,this.type=0,this._pbf=t,this._geometry=-1,this._keys=n,this._values=i,t.readFields(Do,this,e);}function Do(t,e,r){1==t?e.id=r.readVarint():2==t?function(t,e){for(var r=t.readVarint()+t.pos;t.pos<r;){var n=e._keys[t.readVarint()],i=e._values[t.readVarint()];e.properties[n]=i;}}(r,e):3==t?e.type=r.readVarint():4==t&&(e._geometry=r.pos);}function Oo(t){for(var e,r,n=0,i=0,a=t.length,s=a-1;i<a;s=i++)n+=((r=t[s]).x-(e=t[i]).x)*(e.y+r.y);return n}$o.types=["Unknown","Point","LineString","Polygon"],$o.prototype.loadGeometry=function(){var t=this._pbf;t.pos=this._geometry;for(var e,r=t.readVarint()+t.pos,n=1,i=0,a=0,s=0,o=[];t.pos<r;){if(i<=0){var l=t.readVarint();n=7&l,i=l>>3;}if(i--,1===n||2===n)a+=t.readSVarint(),s+=t.readSVarint(),1===n&&(e&&o.push(e),e=[]),e.push(new Fo(a,s));else {if(7!==n)throw new Error("unknown command "+n);e&&e.push(e[0].clone());}}return e&&o.push(e),o},$o.prototype.bbox=function(){var t=this._pbf;t.pos=this._geometry;for(var e=t.readVarint()+t.pos,r=1,n=0,i=0,a=0,s=1/0,o=-1/0,l=1/0,u=-1/0;t.pos<e;){if(n<=0){var c=t.readVarint();r=7&c,n=c>>3;}if(n--,1===r||2===r)(i+=t.readSVarint())<s&&(s=i),i>o&&(o=i),(a+=t.readSVarint())<l&&(l=a),a>u&&(u=a);else if(7!==r)throw new Error("unknown command "+r)}return [s,l,o,u]},$o.prototype.toGeoJSON=function(t,e,r){var n,i,a=this.extent*Math.pow(2,r),s=this.extent*t,o=this.extent*e,l=this.loadGeometry(),u=$o.types[this.type];function c(t){for(var e=0;e<t.length;e++){var r=t[e];t[e]=[360*(r.x+s)/a-180,360/Math.PI*Math.atan(Math.exp((180-360*(r.y+o)/a)*Math.PI/180))-90];}}switch(this.type){case 1:var h=[];for(n=0;n<l.length;n++)h[n]=l[n][0];c(l=h);break;case 2:for(n=0;n<l.length;n++)c(l[n]);break;case 3:for(l=function(t){var e=t.length;if(e<=1)return [t];for(var r,n,i=[],a=0;a<e;a++){var s=Oo(t[a]);0!==s&&(void 0===n&&(n=s<0),n===s<0?(r&&i.push(r),r=[t[a]]):r.push(t[a]));}return r&&i.push(r),i}(l),n=0;n<l.length;n++)for(i=0;i<l[n].length;i++)c(l[n][i]);}1===l.length?l=l[0]:u="Multi"+u;var p={type:"Feature",geometry:{type:u,coordinates:l},properties:this.properties};return "id"in this&&(p.id=this.id),p};var Uo=Lo,Ro=qo;function qo(t,e){this.version=1,this.name=null,this.extent=4096,this.length=0,this._pbf=t,this._keys=[],this._values=[],this._features=[],t.readFields(jo,this,e),this.length=this._features.length;}function jo(t,e,r){15===t?e.version=r.readVarint():1===t?e.name=r.readString():5===t?e.extent=r.readVarint():2===t?e._features.push(r.pos):3===t?e._keys.push(r.readString()):4===t&&e._values.push(function(t){for(var e=null,r=t.readVarint()+t.pos;t.pos<r;){var n=t.readVarint()>>3;e=1===n?t.readString():2===n?t.readFloat():3===n?t.readDouble():4===n?t.readVarint64():5===n?t.readVarint():6===n?t.readSVarint():7===n?t.readBoolean():null;}return e}(r));}qo.prototype.feature=function(t){if(t<0||t>=this._features.length)throw new Error("feature index out of bounds");this._pbf.pos=this._features[t];var e=this._pbf.readVarint()+this._pbf.pos;return new Uo(this._pbf,e,this.extent,this._keys,this._values)};var No=Ro;function Zo(t,e,r){if(3===t){var n=new No(r,r.readVarint()+r.pos);n.length&&(e[n.name]=n);}}To.VectorTile=function(t,e){this.layers=t.readFields(Zo,{},e);},To.VectorTileFeature=Lo,To.VectorTileLayer=Ro;const Ko=To.VectorTileFeature.types,Go=Math.pow(2,13);function Jo(t,e,r,n,i,a,s,o){t.emplaceBack(e,r,2*Math.floor(n*Go)+s,i*Go*2,a*Go*2,Math.round(o));}class Xo{constructor(t){this.zoom=t.zoom,this.overscaling=t.overscaling,this.layers=t.layers,this.layerIds=this.layers.map((t=>t.id)),this.index=t.index,this.hasPattern=!1,this.layoutVertexArray=new oa,this.centroidVertexArray=new ia,this.indexArray=new ma,this.programConfigurations=new Ka(t.layers,t.zoom),this.segments=new ba,this.stateDependentLayerIds=this.layers.filter((t=>t.isStateDependent())).map((t=>t.id));}populate(t,e,r){this.features=[],this.hasPattern=So("fill-extrusion",this.layers,e);for(const{feature:n,id:i,index:a,sourceLayerIndex:s}of t){const t=this.layers[0]._featureFilter.needGeometry,o=Qa(n,t);if(!this.layers[0]._featureFilter.filter(new ei(this.zoom),o,r))continue;const l={id:i,sourceLayerIndex:s,index:a,geometry:t?o.geometry:Wa(n),properties:n.properties,type:n.type,patterns:{}};this.hasPattern?this.features.push(ko("fill-extrusion",this.layers,l,this.zoom,e)):this.addFeature(l,l.geometry,a,r,{}),e.featureIndex.insert(n,l.geometry,a,s,this.index,!0);}}addFeatures(t,e,r){for(const t of this.features){const{geometry:n}=t;this.addFeature(t,n,t.index,e,r);}}update(t,e,r){this.stateDependentLayers.length&&this.programConfigurations.updatePaintArrays(t,e,this.stateDependentLayers,r);}isEmpty(){return 0===this.layoutVertexArray.length&&0===this.centroidVertexArray.length}uploadPending(){return !this.uploaded||this.programConfigurations.needsUpload}upload(t){this.uploaded||(this.layoutVertexBuffer=t.createVertexBuffer(this.layoutVertexArray,Eo),this.centroidVertexBuffer=t.createVertexBuffer(this.centroidVertexArray,Vo.members,!0),this.indexBuffer=t.createIndexBuffer(this.indexArray)),this.programConfigurations.upload(t),this.uploaded=!0;}destroy(){this.layoutVertexBuffer&&(this.layoutVertexBuffer.destroy(),this.indexBuffer.destroy(),this.programConfigurations.destroy(),this.segments.destroy(),this.centroidVertexBuffer.destroy());}addFeature(t,e,r,n,i){const a={x:0,y:0,vertexCount:0};for(const r of _o(e,500)){let e=0;for(const t of r)e+=t.length;let n=this.segments.prepareSegment(4,this.layoutVertexArray,this.indexArray);for(const t of r){if(0===t.length)continue;if(Ho(t))continue;let e=0;for(let r=0;r<t.length;r++){const i=t[r];if(r>=1){const s=t[r-1];if(!Yo(i,s)){n.vertexLength+4>ba.MAX_VERTEX_ARRAY_LENGTH&&(n=this.segments.prepareSegment(4,this.layoutVertexArray,this.indexArray));const t=i.sub(s)._perp()._unit(),r=s.dist(i);e+r>32768&&(e=0),Jo(this.layoutVertexArray,i.x,i.y,t.x,t.y,0,0,e),Jo(this.layoutVertexArray,i.x,i.y,t.x,t.y,0,1,e),a.x+=2*i.x,a.y+=2*i.y,a.vertexCount+=2,e+=r,Jo(this.layoutVertexArray,s.x,s.y,t.x,t.y,0,0,e),Jo(this.layoutVertexArray,s.x,s.y,t.x,t.y,0,1,e),a.x+=2*s.x,a.y+=2*s.y,a.vertexCount+=2;const o=n.vertexLength;this.indexArray.emplaceBack(o,o+2,o+1),this.indexArray.emplaceBack(o+1,o+2,o+3),n.vertexLength+=4,n.primitiveLength+=2;}}}}if(n.vertexLength+e>ba.MAX_VERTEX_ARRAY_LENGTH&&(n=this.segments.prepareSegment(e,this.layoutVertexArray,this.indexArray)),"Polygon"!==Ko[t.type])continue;const i=[],s=[],o=n.vertexLength;for(const t of r)if(0!==t.length){t!==r[0]&&s.push(i.length/2);for(let e=0;e<t.length;e++){const r=t[e];Jo(this.layoutVertexArray,r.x,r.y,0,0,1,1,0),a.x+=r.x,a.y+=r.y,a.vertexCount+=1,i.push(r.x),i.push(r.y);}}const l=go(i,s);for(let t=0;t<l.length;t+=3)this.indexArray.emplaceBack(o+l[t],o+l[t+2],o+l[t+1]);n.primitiveLength+=l.length/3,n.vertexLength+=e;}for(let t=0;t<a.vertexCount;t++)this.centroidVertexArray.emplaceBack(Math.floor(a.x/a.vertexCount),Math.floor(a.y/a.vertexCount));this.programConfigurations.populatePaintArrays(this.layoutVertexArray.length,t,r,i,n);}}function Yo(t,e){return t.x===e.x&&(t.x<0||t.x>Xa)||t.y===e.y&&(t.y<0||t.y>Xa)}function Ho(t){return t.every((t=>t.x<0))||t.every((t=>t.x>Xa))||t.every((t=>t.y<0))||t.every((t=>t.y>Xa))}let Wo;Pn("FillExtrusionBucket",Xo,{omit:["layers","features"]});var Qo={get paint(){return Wo=Wo||new yi({"fill-extrusion-opacity":new ci(q["paint_fill-extrusion"]["fill-extrusion-opacity"]),"fill-extrusion-color":new hi(q["paint_fill-extrusion"]["fill-extrusion-color"]),"fill-extrusion-translate":new ci(q["paint_fill-extrusion"]["fill-extrusion-translate"]),"fill-extrusion-translate-anchor":new ci(q["paint_fill-extrusion"]["fill-extrusion-translate-anchor"]),"fill-extrusion-pattern":new pi(q["paint_fill-extrusion"]["fill-extrusion-pattern"]),"fill-extrusion-height":new hi(q["paint_fill-extrusion"]["fill-extrusion-height"]),"fill-extrusion-base":new hi(q["paint_fill-extrusion"]["fill-extrusion-base"]),"fill-extrusion-vertical-gradient":new ci(q["paint_fill-extrusion"]["fill-extrusion-vertical-gradient"])})}};class tl extends gi{constructor(t){super(t,Qo);}createBucket(t){return new Xo(t)}queryRadius(){return ds(this.paint.get("fill-extrusion-translate"))}is3D(){return !0}queryIntersectsFeature(t,e,r,n,a,s,o,l){const u=ys(t,this.paint.get("fill-extrusion-translate"),this.paint.get("fill-extrusion-translate-anchor"),s.angle,o),c=this.paint.get("fill-extrusion-height").evaluate(e,r),h=this.paint.get("fill-extrusion-base").evaluate(e,r),p=function(t,e,r,n){const a=[];for(const r of t){const t=[r.x,r.y,0,1];ks(t,t,e),a.push(new i(t[0]/t[3],t[1]/t[3]));}return a}(u,l),f=function(t,e,r,n){const a=[],s=[],o=n[8]*e,l=n[9]*e,u=n[10]*e,c=n[11]*e,h=n[8]*r,p=n[9]*r,f=n[10]*r,d=n[11]*r;for(const e of t){const t=[],r=[];for(const a of e){const e=a.x,s=a.y,y=n[0]*e+n[4]*s+n[12],m=n[1]*e+n[5]*s+n[13],g=n[2]*e+n[6]*s+n[14],x=n[3]*e+n[7]*s+n[15],v=g+u,b=x+c,w=y+h,_=m+p,A=g+f,S=x+d,k=new i((y+o)/b,(m+l)/b);k.z=v/b,t.push(k);const I=new i(w/S,_/S);I.z=A/S,r.push(I);}a.push(t),s.push(r);}return [a,s]}(n,h,c,l);return function(t,e,r){let n=1/0;is(r,e)&&(n=rl(r,e[0]));for(let i=0;i<e.length;i++){const a=e[i],s=t[i];for(let t=0;t<a.length-1;t++){const e=a[t],i=[e,a[t+1],s[t+1],s[t],e];rs(r,i)&&(n=Math.min(n,rl(r,i)));}}return n!==1/0&&n}(f[0],f[1],p)}}function el(t,e){return t.x*e.x+t.y*e.y}function rl(t,e){if(1===t.length){let r=0;const n=e[r++];let i;for(;!i||n.equals(i);)if(i=e[r++],!i)return 1/0;for(;r<e.length;r++){const a=e[r],s=t[0],o=i.sub(n),l=a.sub(n),u=s.sub(n),c=el(o,o),h=el(o,l),p=el(l,l),f=el(u,o),d=el(u,l),y=c*p-h*h,m=(p*f-h*d)/y,g=(c*d-h*f)/y,x=n.z*(1-m-g)+i.z*m+a.z*g;if(isFinite(x))return x}return 1/0}{let t=1/0;for(const r of e)t=Math.min(t,r.z);return t}}const nl=wi([{name:"a_pos_normal",components:2,type:"Int16"},{name:"a_data",components:4,type:"Uint8"}],4),{members:il}=nl,al=wi([{name:"a_uv_x",components:1,type:"Float32"},{name:"a_split_index",components:1,type:"Float32"}]),{members:sl}=al,ol=To.VectorTileFeature.types,ll=Math.cos(Math.PI/180*37.5),ul=Math.pow(2,14)/.5;class cl{constructor(t){this.zoom=t.zoom,this.overscaling=t.overscaling,this.layers=t.layers,this.layerIds=this.layers.map((t=>t.id)),this.index=t.index,this.hasPattern=!1,this.patternFeatures=[],this.lineClipsArray=[],this.gradients={},this.layers.forEach((t=>{this.gradients[t.id]={};})),this.layoutVertexArray=new la,this.layoutVertexArray2=new ua,this.indexArray=new ma,this.programConfigurations=new Ka(t.layers,t.zoom),this.segments=new ba,this.maxLineLength=0,this.stateDependentLayerIds=this.layers.filter((t=>t.isStateDependent())).map((t=>t.id));}populate(t,e,r){this.hasPattern=So("line",this.layers,e);const n=this.layers[0].layout.get("line-sort-key"),i=!n.isConstant(),a=[];for(const{feature:e,id:s,index:o,sourceLayerIndex:l}of t){const t=this.layers[0]._featureFilter.needGeometry,u=Qa(e,t);if(!this.layers[0]._featureFilter.filter(new ei(this.zoom),u,r))continue;const c=i?n.evaluate(u,{},r):void 0,h={id:s,properties:e.properties,type:e.type,sourceLayerIndex:l,index:o,geometry:t?u.geometry:Wa(e),patterns:{},sortKey:c};a.push(h);}i&&a.sort(((t,e)=>t.sortKey-e.sortKey));for(const n of a){const{geometry:i,index:a,sourceLayerIndex:s}=n;if(this.hasPattern){const t=ko("line",this.layers,n,this.zoom,e);this.patternFeatures.push(t);}else this.addFeature(n,i,a,r,{});e.featureIndex.insert(t[a].feature,i,a,s,this.index);}}update(t,e,r){this.stateDependentLayers.length&&this.programConfigurations.updatePaintArrays(t,e,this.stateDependentLayers,r);}addFeatures(t,e,r){for(const t of this.patternFeatures)this.addFeature(t,t.geometry,t.index,e,r);}isEmpty(){return 0===this.layoutVertexArray.length}uploadPending(){return !this.uploaded||this.programConfigurations.needsUpload}upload(t){this.uploaded||(0!==this.layoutVertexArray2.length&&(this.layoutVertexBuffer2=t.createVertexBuffer(this.layoutVertexArray2,sl)),this.layoutVertexBuffer=t.createVertexBuffer(this.layoutVertexArray,il),this.indexBuffer=t.createIndexBuffer(this.indexArray)),this.programConfigurations.upload(t),this.uploaded=!0;}destroy(){this.layoutVertexBuffer&&(this.layoutVertexBuffer.destroy(),this.indexBuffer.destroy(),this.programConfigurations.destroy(),this.segments.destroy());}lineFeatureClips(t){if(t.properties&&Object.prototype.hasOwnProperty.call(t.properties,"mapbox_clip_start")&&Object.prototype.hasOwnProperty.call(t.properties,"mapbox_clip_end"))return {start:+t.properties.mapbox_clip_start,end:+t.properties.mapbox_clip_end}}addFeature(t,e,r,n,i){const a=this.layers[0].layout,s=a.get("line-join").evaluate(t,{}),o=a.get("line-cap"),l=a.get("line-miter-limit"),u=a.get("line-round-limit");this.lineClips=this.lineFeatureClips(t);for(const r of e)this.addLine(r,t,s,o,l,u);this.programConfigurations.populatePaintArrays(this.layoutVertexArray.length,t,r,i,n);}addLine(t,e,r,n,i,a){if(this.distance=0,this.scaledDistance=0,this.totalDistance=0,this.lineClips){this.lineClipsArray.push(this.lineClips);for(let e=0;e<t.length-1;e++)this.totalDistance+=t[e].dist(t[e+1]);this.updateScaledDistance(),this.maxLineLength=Math.max(this.maxLineLength,this.totalDistance);}const s="Polygon"===ol[e.type];let o=t.length;for(;o>=2&&t[o-1].equals(t[o-2]);)o--;let l=0;for(;l<o-1&&t[l].equals(t[l+1]);)l++;if(o<(s?3:2))return;"bevel"===r&&(i=1.05);const u=this.overscaling<=16?15*Xa/(512*this.overscaling):0,c=this.segments.prepareSegment(10*o,this.layoutVertexArray,this.indexArray);let h,p,f,d,y;this.e1=this.e2=-1,s&&(h=t[o-2],y=t[l].sub(h)._unit()._perp());for(let e=l;e<o;e++){if(f=e===o-1?s?t[l+1]:void 0:t[e+1],f&&t[e].equals(f))continue;y&&(d=y),h&&(p=h),h=t[e],y=f?f.sub(h)._unit()._perp():d,d=d||y;let m=d.add(y);0===m.x&&0===m.y||m._unit();const g=d.x*y.x+d.y*y.y,x=m.x*y.x+m.y*y.y,v=0!==x?1/x:1/0,b=2*Math.sqrt(2-2*x),w=x<ll&&p&&f,_=d.x*y.y-d.y*y.x>0;if(w&&e>l){const t=h.dist(p);if(t>2*u){const e=h.sub(h.sub(p)._mult(u/t)._round());this.updateDistance(p,e),this.addCurrentVertex(e,d,0,0,c),p=e;}}const A=p&&f;let S=A?r:s?"butt":n;if(A&&"round"===S&&(v<a?S="miter":v<=2&&(S="fakeround")),"miter"===S&&v>i&&(S="bevel"),"bevel"===S&&(v>2&&(S="flipbevel"),v<i&&(S="miter")),p&&this.updateDistance(p,h),"miter"===S)m._mult(v),this.addCurrentVertex(h,m,0,0,c);else if("flipbevel"===S){if(v>100)m=y.mult(-1);else {const t=v*d.add(y).mag()/d.sub(y).mag();m._perp()._mult(t*(_?-1:1));}this.addCurrentVertex(h,m,0,0,c),this.addCurrentVertex(h,m.mult(-1),0,0,c);}else if("bevel"===S||"fakeround"===S){const t=-Math.sqrt(v*v-1),e=_?t:0,r=_?0:t;if(p&&this.addCurrentVertex(h,d,e,r,c),"fakeround"===S){const t=Math.round(180*b/Math.PI/20);for(let e=1;e<t;e++){let r=e/t;if(.5!==r){const t=r-.5;r+=r*t*(r-1)*((1.0904+g*(g*(3.55645-1.43519*g)-3.2452))*t*t+(.848013+g*(.215638*g-1.06021)));}const n=y.sub(d)._mult(r)._add(d)._unit()._mult(_?-1:1);this.addHalfVertex(h,n.x,n.y,!1,_,0,c);}}f&&this.addCurrentVertex(h,y,-e,-r,c);}else if("butt"===S)this.addCurrentVertex(h,m,0,0,c);else if("square"===S){const t=p?1:-1;this.addCurrentVertex(h,m,t,t,c);}else "round"===S&&(p&&(this.addCurrentVertex(h,d,0,0,c),this.addCurrentVertex(h,d,1,1,c,!0)),f&&(this.addCurrentVertex(h,y,-1,-1,c,!0),this.addCurrentVertex(h,y,0,0,c)));if(w&&e<o-1){const t=h.dist(f);if(t>2*u){const e=h.add(f.sub(h)._mult(u/t)._round());this.updateDistance(h,e),this.addCurrentVertex(e,y,0,0,c),h=e;}}}}addCurrentVertex(t,e,r,n,i,a=!1){const s=e.y*n-e.x,o=-e.y-e.x*n;this.addHalfVertex(t,e.x+e.y*r,e.y-e.x*r,a,!1,r,i),this.addHalfVertex(t,s,o,a,!0,-n,i),this.distance>ul/2&&0===this.totalDistance&&(this.distance=0,this.updateScaledDistance(),this.addCurrentVertex(t,e,r,n,i,a));}addHalfVertex({x:t,y:e},r,n,i,a,s,o){const l=.5*(this.lineClips?this.scaledDistance*(ul-1):this.scaledDistance);this.layoutVertexArray.emplaceBack((t<<1)+(i?1:0),(e<<1)+(a?1:0),Math.round(63*r)+128,Math.round(63*n)+128,1+(0===s?0:s<0?-1:1)|(63&l)<<2,l>>6),this.lineClips&&this.layoutVertexArray2.emplaceBack((this.scaledDistance-this.lineClips.start)/(this.lineClips.end-this.lineClips.start),this.lineClipsArray.length);const u=o.vertexLength++;this.e1>=0&&this.e2>=0&&(this.indexArray.emplaceBack(this.e1,this.e2,u),o.primitiveLength++),a?this.e2=u:this.e1=u;}updateScaledDistance(){this.scaledDistance=this.lineClips?this.lineClips.start+(this.lineClips.end-this.lineClips.start)*this.distance/this.totalDistance:this.distance;}updateDistance(t,e){this.distance+=t.dist(e),this.updateScaledDistance();}}let hl,pl;Pn("LineBucket",cl,{omit:["layers","patternFeatures"]});var fl={get paint(){return pl=pl||new yi({"line-opacity":new hi(q.paint_line["line-opacity"]),"line-color":new hi(q.paint_line["line-color"]),"line-translate":new ci(q.paint_line["line-translate"]),"line-translate-anchor":new ci(q.paint_line["line-translate-anchor"]),"line-width":new hi(q.paint_line["line-width"]),"line-gap-width":new hi(q.paint_line["line-gap-width"]),"line-offset":new hi(q.paint_line["line-offset"]),"line-blur":new hi(q.paint_line["line-blur"]),"line-dasharray":new fi(q.paint_line["line-dasharray"]),"line-pattern":new pi(q.paint_line["line-pattern"]),"line-gradient":new di(q.paint_line["line-gradient"])})},get layout(){return hl=hl||new yi({"line-cap":new ci(q.layout_line["line-cap"]),"line-join":new hi(q.layout_line["line-join"]),"line-miter-limit":new ci(q.layout_line["line-miter-limit"]),"line-round-limit":new ci(q.layout_line["line-round-limit"]),"line-sort-key":new hi(q.layout_line["line-sort-key"])})}};class dl extends hi{possiblyEvaluate(t,e){return e=new ei(Math.floor(e.zoom),{now:e.now,fadeDuration:e.fadeDuration,zoomHistory:e.zoomHistory,transition:e.transition}),super.possiblyEvaluate(t,e)}evaluate(t,e,r,n){return e=p({},e,{zoom:Math.floor(e.zoom)}),super.evaluate(t,e,r,n)}}let yl;class ml extends gi{constructor(t){super(t,fl),this.gradientVersion=0,yl||(yl=new dl(fl.paint.properties["line-width"].specification),yl.useIntegerZoom=!0);}_handleSpecialPaintPropertyUpdate(t){"line-gradient"===t&&(this.stepInterpolant=this._transitionablePaint._values["line-gradient"].value.expression._styleExpression.expression instanceof Fe,this.gradientVersion=(this.gradientVersion+1)%Number.MAX_SAFE_INTEGER);}gradientExpression(){return this._transitionablePaint._values["line-gradient"].value.expression}recalculate(t,e){super.recalculate(t,e),this.paint._values["line-floorwidth"]=yl.possiblyEvaluate(this._transitioningPaint._values["line-width"].value,t);}createBucket(t){return new cl(t)}queryRadius(t){const e=t,r=gl(fs("line-width",this,e),fs("line-gap-width",this,e)),n=fs("line-offset",this,e);return r/2+Math.abs(n)+ds(this.paint.get("line-translate"))}queryIntersectsFeature(t,e,r,n,a,s,o){const l=ys(t,this.paint.get("line-translate"),this.paint.get("line-translate-anchor"),s.angle,o),u=o/2*gl(this.paint.get("line-width").evaluate(e,r),this.paint.get("line-gap-width").evaluate(e,r)),c=this.paint.get("line-offset").evaluate(e,r);return c&&(n=function(t,e){const r=[];for(let n=0;n<t.length;n++){const a=t[n],s=[];for(let t=0;t<a.length;t++){const r=a[t-1],n=a[t],o=a[t+1],l=0===t?new i(0,0):n.sub(r)._unit()._perp(),u=t===a.length-1?new i(0,0):o.sub(n)._unit()._perp(),c=l._add(u)._unit(),h=c.x*u.x+c.y*u.y;0!==h&&c._mult(1/h),s.push(c._mult(e)._add(n));}r.push(s);}return r}(n,c*o)),function(t,e,r){for(let n=0;n<e.length;n++){const i=e[n];if(t.length>=3)for(let e=0;e<i.length;e++)if(hs(t,i[e]))return !0;if(as(t,i,r))return !0}return !1}(l,n,u)}isTileClipped(){return !0}}function gl(t,e){return e>0?e+2*t:t}const xl=wi([{name:"a_pos_offset",components:4,type:"Int16"},{name:"a_data",components:4,type:"Uint16"},{name:"a_pixeloffset",components:4,type:"Int16"}],4),vl=wi([{name:"a_projected_pos",components:3,type:"Float32"}],4);wi([{name:"a_fade_opacity",components:1,type:"Uint32"}],4);const bl=wi([{name:"a_placed",components:2,type:"Uint8"},{name:"a_shift",components:2,type:"Float32"}]);wi([{type:"Int16",name:"anchorPointX"},{type:"Int16",name:"anchorPointY"},{type:"Int16",name:"x1"},{type:"Int16",name:"y1"},{type:"Int16",name:"x2"},{type:"Int16",name:"y2"},{type:"Uint32",name:"featureIndex"},{type:"Uint16",name:"sourceLayerIndex"},{type:"Uint16",name:"bucketIndex"}]);const wl=wi([{name:"a_pos",components:2,type:"Int16"},{name:"a_anchor_pos",components:2,type:"Int16"},{name:"a_extrude",components:2,type:"Int16"}],4),_l=wi([{name:"a_pos",components:2,type:"Float32"},{name:"a_radius",components:1,type:"Float32"},{name:"a_flags",components:2,type:"Int16"}],4);function Al(t,e,r){return t.sections.forEach((t=>{t.text=function(t,e,r){const n=e.layout.get("text-transform").evaluate(r,{});return "uppercase"===n?t=t.toLocaleUpperCase():"lowercase"===n&&(t=t.toLocaleLowerCase()),ti.applyArabicShaping&&(t=ti.applyArabicShaping(t)),t}(t.text,e,r);})),t}wi([{name:"triangle",components:3,type:"Uint16"}]),wi([{type:"Int16",name:"anchorX"},{type:"Int16",name:"anchorY"},{type:"Uint16",name:"glyphStartIndex"},{type:"Uint16",name:"numGlyphs"},{type:"Uint32",name:"vertexStartIndex"},{type:"Uint32",name:"lineStartIndex"},{type:"Uint32",name:"lineLength"},{type:"Uint16",name:"segment"},{type:"Uint16",name:"lowerSize"},{type:"Uint16",name:"upperSize"},{type:"Float32",name:"lineOffsetX"},{type:"Float32",name:"lineOffsetY"},{type:"Uint8",name:"writingMode"},{type:"Uint8",name:"placedOrientation"},{type:"Uint8",name:"hidden"},{type:"Uint32",name:"crossTileID"},{type:"Int16",name:"associatedIconIndex"}]),wi([{type:"Int16",name:"anchorX"},{type:"Int16",name:"anchorY"},{type:"Int16",name:"rightJustifiedTextSymbolIndex"},{type:"Int16",name:"centerJustifiedTextSymbolIndex"},{type:"Int16",name:"leftJustifiedTextSymbolIndex"},{type:"Int16",name:"verticalPlacedTextSymbolIndex"},{type:"Int16",name:"placedIconSymbolIndex"},{type:"Int16",name:"verticalPlacedIconSymbolIndex"},{type:"Uint16",name:"key"},{type:"Uint16",name:"textBoxStartIndex"},{type:"Uint16",name:"textBoxEndIndex"},{type:"Uint16",name:"verticalTextBoxStartIndex"},{type:"Uint16",name:"verticalTextBoxEndIndex"},{type:"Uint16",name:"iconBoxStartIndex"},{type:"Uint16",name:"iconBoxEndIndex"},{type:"Uint16",name:"verticalIconBoxStartIndex"},{type:"Uint16",name:"verticalIconBoxEndIndex"},{type:"Uint16",name:"featureIndex"},{type:"Uint16",name:"numHorizontalGlyphVertices"},{type:"Uint16",name:"numVerticalGlyphVertices"},{type:"Uint16",name:"numIconVertices"},{type:"Uint16",name:"numVerticalIconVertices"},{type:"Uint16",name:"useRuntimeCollisionCircles"},{type:"Uint32",name:"crossTileID"},{type:"Float32",name:"textBoxScale"},{type:"Float32",name:"collisionCircleDiameter"},{type:"Uint16",name:"textAnchorOffsetStartIndex"},{type:"Uint16",name:"textAnchorOffsetEndIndex"}]),wi([{type:"Float32",name:"offsetX"}]),wi([{type:"Int16",name:"x"},{type:"Int16",name:"y"},{type:"Int16",name:"tileUnitDistanceFromAnchor"}]),wi([{type:"Uint16",name:"textAnchor"},{type:"Float32",components:2,name:"textOffset"}]);const Sl={"!":"︕","#":"＃",$:"＄","%":"％","&":"＆","(":"︵",")":"︶","*":"＊","+":"＋",",":"︐","-":"︲",".":"・","/":"／",":":"︓",";":"︔","<":"︿","=":"＝",">":"﹀","?":"︖","@":"＠","[":"﹇","\\":"＼","]":"﹈","^":"＾",_:"︳","`":"｀","{":"︷","|":"―","}":"︸","~":"～","¢":"￠","£":"￡","¥":"￥","¦":"￤","¬":"￢","¯":"￣","–":"︲","—":"︱","‘":"﹃","’":"﹄","“":"﹁","”":"﹂","…":"︙","‧":"・","₩":"￦","、":"︑","。":"︒","〈":"︿","〉":"﹀","《":"︽","》":"︾","「":"﹁","」":"﹂","『":"﹃","』":"﹄","【":"︻","】":"︼","〔":"︹","〕":"︺","〖":"︗","〗":"︘","！":"︕","（":"︵","）":"︶","，":"︐","－":"︲","．":"・","：":"︓","；":"︔","＜":"︿","＞":"﹀","？":"︖","［":"﹇","］":"﹈","＿":"︳","｛":"︷","｜":"―","｝":"︸","｟":"︵","｠":"︶","｡":"︒","｢":"﹁","｣":"﹂"};var kl=24,Il=Pl,zl=function(t,e,r,n,i){var a,s,o=8*i-n-1,l=(1<<o)-1,u=l>>1,c=-7,h=r?i-1:0,p=r?-1:1,f=t[e+h];for(h+=p,a=f&(1<<-c)-1,f>>=-c,c+=o;c>0;a=256*a+t[e+h],h+=p,c-=8);for(s=a&(1<<-c)-1,a>>=-c,c+=n;c>0;s=256*s+t[e+h],h+=p,c-=8);if(0===a)a=1-u;else {if(a===l)return s?NaN:1/0*(f?-1:1);s+=Math.pow(2,n),a-=u;}return (f?-1:1)*s*Math.pow(2,a-n)},Ml=function(t,e,r,n,i,a){var s,o,l,u=8*a-i-1,c=(1<<u)-1,h=c>>1,p=23===i?Math.pow(2,-24)-Math.pow(2,-77):0,f=n?0:a-1,d=n?1:-1,y=e<0||0===e&&1/e<0?1:0;for(e=Math.abs(e),isNaN(e)||e===1/0?(o=isNaN(e)?1:0,s=c):(s=Math.floor(Math.log(e)/Math.LN2),e*(l=Math.pow(2,-s))<1&&(s--,l*=2),(e+=s+h>=1?p/l:p*Math.pow(2,1-h))*l>=2&&(s++,l/=2),s+h>=c?(o=0,s=c):s+h>=1?(o=(e*l-1)*Math.pow(2,i),s+=h):(o=e*Math.pow(2,h-1)*Math.pow(2,i),s=0));i>=8;t[r+f]=255&o,f+=d,o/=256,i-=8);for(s=s<<i|o,u+=i;u>0;t[r+f]=255&s,f+=d,s/=256,u-=8);t[r+f-d]|=128*y;};function Pl(t){this.buf=ArrayBuffer.isView&&ArrayBuffer.isView(t)?t:new Uint8Array(t||0),this.pos=0,this.type=0,this.length=this.buf.length;}Pl.Varint=0,Pl.Fixed64=1,Pl.Bytes=2,Pl.Fixed32=5;var Bl=4294967296,Cl=1/Bl,Vl="undefined"==typeof TextDecoder?null:new TextDecoder("utf8");function El(t){return t.type===Pl.Bytes?t.readVarint()+t.pos:t.pos+1}function Tl(t,e,r){return r?4294967296*e+(t>>>0):4294967296*(e>>>0)+(t>>>0)}function Fl(t,e,r){var n=e<=16383?1:e<=2097151?2:e<=268435455?3:Math.floor(Math.log(e)/(7*Math.LN2));r.realloc(n);for(var i=r.pos-1;i>=t;i--)r.buf[i+n]=r.buf[i];}function Ll(t,e){for(var r=0;r<t.length;r++)e.writeVarint(t[r]);}function $l(t,e){for(var r=0;r<t.length;r++)e.writeSVarint(t[r]);}function Dl(t,e){for(var r=0;r<t.length;r++)e.writeFloat(t[r]);}function Ol(t,e){for(var r=0;r<t.length;r++)e.writeDouble(t[r]);}function Ul(t,e){for(var r=0;r<t.length;r++)e.writeBoolean(t[r]);}function Rl(t,e){for(var r=0;r<t.length;r++)e.writeFixed32(t[r]);}function ql(t,e){for(var r=0;r<t.length;r++)e.writeSFixed32(t[r]);}function jl(t,e){for(var r=0;r<t.length;r++)e.writeFixed64(t[r]);}function Nl(t,e){for(var r=0;r<t.length;r++)e.writeSFixed64(t[r]);}function Zl(t,e){return (t[e]|t[e+1]<<8|t[e+2]<<16)+16777216*t[e+3]}function Kl(t,e,r){t[r]=e,t[r+1]=e>>>8,t[r+2]=e>>>16,t[r+3]=e>>>24;}function Gl(t,e){return (t[e]|t[e+1]<<8|t[e+2]<<16)+(t[e+3]<<24)}Pl.prototype={destroy:function(){this.buf=null;},readFields:function(t,e,r){for(r=r||this.length;this.pos<r;){var n=this.readVarint(),i=n>>3,a=this.pos;this.type=7&n,t(i,e,this),this.pos===a&&this.skip(n);}return e},readMessage:function(t,e){return this.readFields(t,e,this.readVarint()+this.pos)},readFixed32:function(){var t=Zl(this.buf,this.pos);return this.pos+=4,t},readSFixed32:function(){var t=Gl(this.buf,this.pos);return this.pos+=4,t},readFixed64:function(){var t=Zl(this.buf,this.pos)+Zl(this.buf,this.pos+4)*Bl;return this.pos+=8,t},readSFixed64:function(){var t=Zl(this.buf,this.pos)+Gl(this.buf,this.pos+4)*Bl;return this.pos+=8,t},readFloat:function(){var t=zl(this.buf,this.pos,!0,23,4);return this.pos+=4,t},readDouble:function(){var t=zl(this.buf,this.pos,!0,52,8);return this.pos+=8,t},readVarint:function(t){var e,r,n=this.buf;return e=127&(r=n[this.pos++]),r<128?e:(e|=(127&(r=n[this.pos++]))<<7,r<128?e:(e|=(127&(r=n[this.pos++]))<<14,r<128?e:(e|=(127&(r=n[this.pos++]))<<21,r<128?e:function(t,e,r){var n,i,a=r.buf;if(n=(112&(i=a[r.pos++]))>>4,i<128)return Tl(t,n,e);if(n|=(127&(i=a[r.pos++]))<<3,i<128)return Tl(t,n,e);if(n|=(127&(i=a[r.pos++]))<<10,i<128)return Tl(t,n,e);if(n|=(127&(i=a[r.pos++]))<<17,i<128)return Tl(t,n,e);if(n|=(127&(i=a[r.pos++]))<<24,i<128)return Tl(t,n,e);if(n|=(1&(i=a[r.pos++]))<<31,i<128)return Tl(t,n,e);throw new Error("Expected varint not more than 10 bytes")}(e|=(15&(r=n[this.pos]))<<28,t,this))))},readVarint64:function(){return this.readVarint(!0)},readSVarint:function(){var t=this.readVarint();return t%2==1?(t+1)/-2:t/2},readBoolean:function(){return Boolean(this.readVarint())},readString:function(){var t=this.readVarint()+this.pos,e=this.pos;return this.pos=t,t-e>=12&&Vl?function(t,e,r){return Vl.decode(t.subarray(e,r))}(this.buf,e,t):function(t,e,r){for(var n="",i=e;i<r;){var a,s,o,l=t[i],u=null,c=l>239?4:l>223?3:l>191?2:1;if(i+c>r)break;1===c?l<128&&(u=l):2===c?128==(192&(a=t[i+1]))&&(u=(31&l)<<6|63&a)<=127&&(u=null):3===c?(s=t[i+2],128==(192&(a=t[i+1]))&&128==(192&s)&&((u=(15&l)<<12|(63&a)<<6|63&s)<=2047||u>=55296&&u<=57343)&&(u=null)):4===c&&(s=t[i+2],o=t[i+3],128==(192&(a=t[i+1]))&&128==(192&s)&&128==(192&o)&&((u=(15&l)<<18|(63&a)<<12|(63&s)<<6|63&o)<=65535||u>=1114112)&&(u=null)),null===u?(u=65533,c=1):u>65535&&(u-=65536,n+=String.fromCharCode(u>>>10&1023|55296),u=56320|1023&u),n+=String.fromCharCode(u),i+=c;}return n}(this.buf,e,t)},readBytes:function(){var t=this.readVarint()+this.pos,e=this.buf.subarray(this.pos,t);return this.pos=t,e},readPackedVarint:function(t,e){if(this.type!==Pl.Bytes)return t.push(this.readVarint(e));var r=El(this);for(t=t||[];this.pos<r;)t.push(this.readVarint(e));return t},readPackedSVarint:function(t){if(this.type!==Pl.Bytes)return t.push(this.readSVarint());var e=El(this);for(t=t||[];this.pos<e;)t.push(this.readSVarint());return t},readPackedBoolean:function(t){if(this.type!==Pl.Bytes)return t.push(this.readBoolean());var e=El(this);for(t=t||[];this.pos<e;)t.push(this.readBoolean());return t},readPackedFloat:function(t){if(this.type!==Pl.Bytes)return t.push(this.readFloat());var e=El(this);for(t=t||[];this.pos<e;)t.push(this.readFloat());return t},readPackedDouble:function(t){if(this.type!==Pl.Bytes)return t.push(this.readDouble());var e=El(this);for(t=t||[];this.pos<e;)t.push(this.readDouble());return t},readPackedFixed32:function(t){if(this.type!==Pl.Bytes)return t.push(this.readFixed32());var e=El(this);for(t=t||[];this.pos<e;)t.push(this.readFixed32());return t},readPackedSFixed32:function(t){if(this.type!==Pl.Bytes)return t.push(this.readSFixed32());var e=El(this);for(t=t||[];this.pos<e;)t.push(this.readSFixed32());return t},readPackedFixed64:function(t){if(this.type!==Pl.Bytes)return t.push(this.readFixed64());var e=El(this);for(t=t||[];this.pos<e;)t.push(this.readFixed64());return t},readPackedSFixed64:function(t){if(this.type!==Pl.Bytes)return t.push(this.readSFixed64());var e=El(this);for(t=t||[];this.pos<e;)t.push(this.readSFixed64());return t},skip:function(t){var e=7&t;if(e===Pl.Varint)for(;this.buf[this.pos++]>127;);else if(e===Pl.Bytes)this.pos=this.readVarint()+this.pos;else if(e===Pl.Fixed32)this.pos+=4;else {if(e!==Pl.Fixed64)throw new Error("Unimplemented type: "+e);this.pos+=8;}},writeTag:function(t,e){this.writeVarint(t<<3|e);},realloc:function(t){for(var e=this.length||16;e<this.pos+t;)e*=2;if(e!==this.length){var r=new Uint8Array(e);r.set(this.buf),this.buf=r,this.length=e;}},finish:function(){return this.length=this.pos,this.pos=0,this.buf.subarray(0,this.length)},writeFixed32:function(t){this.realloc(4),Kl(this.buf,t,this.pos),this.pos+=4;},writeSFixed32:function(t){this.realloc(4),Kl(this.buf,t,this.pos),this.pos+=4;},writeFixed64:function(t){this.realloc(8),Kl(this.buf,-1&t,this.pos),Kl(this.buf,Math.floor(t*Cl),this.pos+4),this.pos+=8;},writeSFixed64:function(t){this.realloc(8),Kl(this.buf,-1&t,this.pos),Kl(this.buf,Math.floor(t*Cl),this.pos+4),this.pos+=8;},writeVarint:function(t){(t=+t||0)>268435455||t<0?function(t,e){var r,n;if(t>=0?(r=t%4294967296|0,n=t/4294967296|0):(n=~(-t/4294967296),4294967295^(r=~(-t%4294967296))?r=r+1|0:(r=0,n=n+1|0)),t>=0x10000000000000000||t<-0x10000000000000000)throw new Error("Given varint doesn't fit into 10 bytes");e.realloc(10),function(t,e,r){r.buf[r.pos++]=127&t|128,t>>>=7,r.buf[r.pos++]=127&t|128,t>>>=7,r.buf[r.pos++]=127&t|128,t>>>=7,r.buf[r.pos++]=127&t|128,r.buf[r.pos]=127&(t>>>=7);}(r,0,e),function(t,e){var r=(7&t)<<4;e.buf[e.pos++]|=r|((t>>>=3)?128:0),t&&(e.buf[e.pos++]=127&t|((t>>>=7)?128:0),t&&(e.buf[e.pos++]=127&t|((t>>>=7)?128:0),t&&(e.buf[e.pos++]=127&t|((t>>>=7)?128:0),t&&(e.buf[e.pos++]=127&t|((t>>>=7)?128:0),t&&(e.buf[e.pos++]=127&t)))));}(n,e);}(t,this):(this.realloc(4),this.buf[this.pos++]=127&t|(t>127?128:0),t<=127||(this.buf[this.pos++]=127&(t>>>=7)|(t>127?128:0),t<=127||(this.buf[this.pos++]=127&(t>>>=7)|(t>127?128:0),t<=127||(this.buf[this.pos++]=t>>>7&127))));},writeSVarint:function(t){this.writeVarint(t<0?2*-t-1:2*t);},writeBoolean:function(t){this.writeVarint(Boolean(t));},writeString:function(t){t=String(t),this.realloc(4*t.length),this.pos++;var e=this.pos;this.pos=function(t,e,r){for(var n,i,a=0;a<e.length;a++){if((n=e.charCodeAt(a))>55295&&n<57344){if(!i){n>56319||a+1===e.length?(t[r++]=239,t[r++]=191,t[r++]=189):i=n;continue}if(n<56320){t[r++]=239,t[r++]=191,t[r++]=189,i=n;continue}n=i-55296<<10|n-56320|65536,i=null;}else i&&(t[r++]=239,t[r++]=191,t[r++]=189,i=null);n<128?t[r++]=n:(n<2048?t[r++]=n>>6|192:(n<65536?t[r++]=n>>12|224:(t[r++]=n>>18|240,t[r++]=n>>12&63|128),t[r++]=n>>6&63|128),t[r++]=63&n|128);}return r}(this.buf,t,this.pos);var r=this.pos-e;r>=128&&Fl(e,r,this),this.pos=e-1,this.writeVarint(r),this.pos+=r;},writeFloat:function(t){this.realloc(4),Ml(this.buf,t,this.pos,!0,23,4),this.pos+=4;},writeDouble:function(t){this.realloc(8),Ml(this.buf,t,this.pos,!0,52,8),this.pos+=8;},writeBytes:function(t){var e=t.length;this.writeVarint(e),this.realloc(e);for(var r=0;r<e;r++)this.buf[this.pos++]=t[r];},writeRawMessage:function(t,e){this.pos++;var r=this.pos;t(e,this);var n=this.pos-r;n>=128&&Fl(r,n,this),this.pos=r-1,this.writeVarint(n),this.pos+=n;},writeMessage:function(t,e,r){this.writeTag(t,Pl.Bytes),this.writeRawMessage(e,r);},writePackedVarint:function(t,e){e.length&&this.writeMessage(t,Ll,e);},writePackedSVarint:function(t,e){e.length&&this.writeMessage(t,$l,e);},writePackedBoolean:function(t,e){e.length&&this.writeMessage(t,Ul,e);},writePackedFloat:function(t,e){e.length&&this.writeMessage(t,Dl,e);},writePackedDouble:function(t,e){e.length&&this.writeMessage(t,Ol,e);},writePackedFixed32:function(t,e){e.length&&this.writeMessage(t,Rl,e);},writePackedSFixed32:function(t,e){e.length&&this.writeMessage(t,ql,e);},writePackedFixed64:function(t,e){e.length&&this.writeMessage(t,jl,e);},writePackedSFixed64:function(t,e){e.length&&this.writeMessage(t,Nl,e);},writeBytesField:function(t,e){this.writeTag(t,Pl.Bytes),this.writeBytes(e);},writeFixed32Field:function(t,e){this.writeTag(t,Pl.Fixed32),this.writeFixed32(e);},writeSFixed32Field:function(t,e){this.writeTag(t,Pl.Fixed32),this.writeSFixed32(e);},writeFixed64Field:function(t,e){this.writeTag(t,Pl.Fixed64),this.writeFixed64(e);},writeSFixed64Field:function(t,e){this.writeTag(t,Pl.Fixed64),this.writeSFixed64(e);},writeVarintField:function(t,e){this.writeTag(t,Pl.Varint),this.writeVarint(e);},writeSVarintField:function(t,e){this.writeTag(t,Pl.Varint),this.writeSVarint(e);},writeStringField:function(t,e){this.writeTag(t,Pl.Bytes),this.writeString(e);},writeFloatField:function(t,e){this.writeTag(t,Pl.Fixed32),this.writeFloat(e);},writeDoubleField:function(t,e){this.writeTag(t,Pl.Fixed64),this.writeDouble(e);},writeBooleanField:function(t,e){this.writeVarintField(t,Boolean(e));}};var Jl=e(Il);const Xl=3;function Yl(t,e,r){1===t&&r.readMessage(Hl,e);}function Hl(t,e,r){if(3===t){const{id:t,bitmap:n,width:i,height:a,left:s,top:o,advance:l}=r.readMessage(Wl,{});e.push({id:t,bitmap:new Ts({width:i+2*Xl,height:a+2*Xl},n),metrics:{width:i,height:a,left:s,top:o,advance:l}});}}function Wl(t,e,r){1===t?e.id=r.readVarint():2===t?e.bitmap=r.readBytes():3===t?e.width=r.readVarint():4===t?e.height=r.readVarint():5===t?e.left=r.readSVarint():6===t?e.top=r.readSVarint():7===t&&(e.advance=r.readVarint());}const Ql=Xl;function tu(t){let e=0,r=0;for(const n of t)e+=n.w*n.h,r=Math.max(r,n.w);t.sort(((t,e)=>e.h-t.h));const n=[{x:0,y:0,w:Math.max(Math.ceil(Math.sqrt(e/.95)),r),h:1/0}];let i=0,a=0;for(const e of t)for(let t=n.length-1;t>=0;t--){const r=n[t];if(!(e.w>r.w||e.h>r.h)){if(e.x=r.x,e.y=r.y,a=Math.max(a,e.y+e.h),i=Math.max(i,e.x+e.w),e.w===r.w&&e.h===r.h){const e=n.pop();t<n.length&&(n[t]=e);}else e.h===r.h?(r.x+=e.w,r.w-=e.w):e.w===r.w?(r.y+=e.h,r.h-=e.h):(n.push({x:r.x+e.w,y:r.y,w:r.w-e.w,h:e.h}),r.y+=e.h,r.h-=e.h);break}}return {w:i,h:a,fill:e/(i*a)||0}}const eu=1;class ru{constructor(t,{pixelRatio:e,version:r,stretchX:n,stretchY:i,content:a}){this.paddedRect=t,this.pixelRatio=e,this.stretchX=n,this.stretchY=i,this.content=a,this.version=r;}get tl(){return [this.paddedRect.x+eu,this.paddedRect.y+eu]}get br(){return [this.paddedRect.x+this.paddedRect.w-eu,this.paddedRect.y+this.paddedRect.h-eu]}get tlbr(){return this.tl.concat(this.br)}get displaySize(){return [(this.paddedRect.w-2*eu)/this.pixelRatio,(this.paddedRect.h-2*eu)/this.pixelRatio]}}class nu{constructor(t,e){const r={},n={};this.haveRenderCallbacks=[];const i=[];this.addImages(t,r,i),this.addImages(e,n,i);const{w:a,h:s}=tu(i),o=new Fs({width:a||1,height:s||1});for(const e in t){const n=t[e],i=r[e].paddedRect;Fs.copy(n.data,o,{x:0,y:0},{x:i.x+eu,y:i.y+eu},n.data);}for(const t in e){const r=e[t],i=n[t].paddedRect,a=i.x+eu,s=i.y+eu,l=r.data.width,u=r.data.height;Fs.copy(r.data,o,{x:0,y:0},{x:a,y:s},r.data),Fs.copy(r.data,o,{x:0,y:u-1},{x:a,y:s-1},{width:l,height:1}),Fs.copy(r.data,o,{x:0,y:0},{x:a,y:s+u},{width:l,height:1}),Fs.copy(r.data,o,{x:l-1,y:0},{x:a-1,y:s},{width:1,height:u}),Fs.copy(r.data,o,{x:0,y:0},{x:a+l,y:s},{width:1,height:u});}this.image=o,this.iconPositions=r,this.patternPositions=n;}addImages(t,e,r){for(const n in t){const i=t[n],a={x:0,y:0,w:i.data.width+2*eu,h:i.data.height+2*eu};r.push(a),e[n]=new ru(a,i),i.hasRenderCallback&&this.haveRenderCallbacks.push(n);}}patchUpdatedImages(t,e){t.dispatchRenderCallbacks(this.haveRenderCallbacks);for(const r in t.updatedImages)this.patchUpdatedImage(this.iconPositions[r],t.getImage(r),e),this.patchUpdatedImage(this.patternPositions[r],t.getImage(r),e);}patchUpdatedImage(t,e,r){if(!t||!e)return;if(t.version===e.version)return;t.version=e.version;const[n,i]=t.tl;r.update(e.data,void 0,{x:n,y:i});}}var iu;Pn("ImagePosition",ru),Pn("ImageAtlas",nu),t.WritingMode=void 0,(iu=t.WritingMode||(t.WritingMode={}))[iu.none=0]="none",iu[iu.horizontal=1]="horizontal",iu[iu.vertical=2]="vertical",iu[iu.horizontalOnly=3]="horizontalOnly";const au=-17;class su{constructor(){this.scale=1,this.fontStack="",this.imageName=null;}static forText(t,e){const r=new su;return r.scale=t||1,r.fontStack=e,r}static forImage(t){const e=new su;return e.imageName=t,e}}class ou{constructor(){this.text="",this.sectionIndex=[],this.sections=[],this.imageSectionID=null;}static fromFeature(t,e){const r=new ou;for(let n=0;n<t.sections.length;n++){const i=t.sections[n];i.image?r.addImageSection(i):r.addTextSection(i,e);}return r}length(){return this.text.length}getSection(t){return this.sections[this.sectionIndex[t]]}getSectionIndex(t){return this.sectionIndex[t]}getCharCode(t){return this.text.charCodeAt(t)}verticalizePunctuation(){this.text=function(t){let e="";for(let r=0;r<t.length;r++){const n=t.charCodeAt(r+1)||null,i=t.charCodeAt(r-1)||null;e+=n&&On(n)&&!Sl[t[r+1]]||i&&On(i)&&!Sl[t[r-1]]||!Sl[t[r]]?t[r]:Sl[t[r]];}return e}(this.text);}trim(){let t=0;for(let e=0;e<this.text.length&&uu[this.text.charCodeAt(e)];e++)t++;let e=this.text.length;for(let r=this.text.length-1;r>=0&&r>=t&&uu[this.text.charCodeAt(r)];r--)e--;this.text=this.text.substring(t,e),this.sectionIndex=this.sectionIndex.slice(t,e);}substring(t,e){const r=new ou;return r.text=this.text.substring(t,e),r.sectionIndex=this.sectionIndex.slice(t,e),r.sections=this.sections,r}toString(){return this.text}getMaxScale(){return this.sectionIndex.reduce(((t,e)=>Math.max(t,this.sections[e].scale)),0)}addTextSection(t,e){this.text+=t.text,this.sections.push(su.forText(t.scale,t.fontStack||e));const r=this.sections.length-1;for(let e=0;e<t.text.length;++e)this.sectionIndex.push(r);}addImageSection(t){const e=t.image?t.image.name:"";if(0===e.length)return void x("Can't add FormattedSection with an empty image.");const r=this.getNextImageSectionCharCode();r?(this.text+=String.fromCharCode(r),this.sections.push(su.forImage(e)),this.sectionIndex.push(this.sections.length-1)):x("Reached maximum number of images 6401");}getNextImageSectionCharCode(){return this.imageSectionID?this.imageSectionID>=63743?null:++this.imageSectionID:(this.imageSectionID=57344,this.imageSectionID)}}function lu(e,r,n,i,a,s,o,l,u,c,h,p,f,d,y,m){const g=ou.fromFeature(e,a);let x;p===t.WritingMode.vertical&&g.verticalizePunctuation();const{processBidirectionalText:v,processStyledBidirectionalText:b}=ti;if(v&&1===g.sections.length){x=[];const t=v(g.toString(),mu(g,c,s,r,i,d,y));for(const e of t){const t=new ou;t.text=e,t.sections=g.sections;for(let r=0;r<e.length;r++)t.sectionIndex.push(0);x.push(t);}}else if(b){x=[];const t=b(g.text,g.sectionIndex,mu(g,c,s,r,i,d,y));for(const e of t){const t=new ou;t.text=e[0],t.sectionIndex=e[1],t.sections=g.sections,x.push(t);}}else x=function(t,e){const r=[],n=t.text;let i=0;for(const n of e)r.push(t.substring(i,n)),i=n;return i<n.length&&r.push(t.substring(i,n.length)),r}(g,mu(g,c,s,r,i,d,y));const w=[],_={positionedLines:w,text:g.toString(),top:h[1],bottom:h[1],left:h[0],right:h[0],writingMode:p,iconsInText:!1,verticalizable:!1};return function(e,r,n,i,a,s,o,l,u,c,h,p){let f=0,d=au,y=0,m=0;const g="right"===l?1:"left"===l?0:.5;let x=0;for(const o of a){o.trim();const a=o.getMaxScale(),l=(a-1)*kl,b={positionedGlyphs:[],lineOffset:0};e.positionedLines[x]=b;const w=b.positionedGlyphs;let _=0;if(!o.length()){d+=s,++x;continue}for(let s=0;s<o.length();s++){const y=o.getSection(s),m=o.getSectionIndex(s),g=o.getCharCode(s);let x=0,b=null,A=null,S=null,k=kl;const I=!(u===t.WritingMode.horizontal||!h&&!Dn(g)||h&&(uu[g]||(v=g,Tn.Arabic(v)||Tn["Arabic Supplement"](v)||Tn["Arabic Extended-A"](v)||Tn["Arabic Presentation Forms-A"](v)||Tn["Arabic Presentation Forms-B"](v))));if(y.imageName){const t=i[y.imageName];if(!t)continue;S=y.imageName,e.iconsInText=e.iconsInText||!0,A=t.paddedRect;const r=t.displaySize;y.scale=y.scale*kl/p,b={width:r[0],height:r[1],left:eu,top:-Ql,advance:I?r[1]:r[0]},x=l+(kl-r[1]*y.scale),k=b.advance;const n=I?r[0]*y.scale-kl*a:r[1]*y.scale-kl*a;n>0&&n>_&&(_=n);}else {const t=n[y.fontStack],e=t&&t[g];if(e&&e.rect)A=e.rect,b=e.metrics;else {const t=r[y.fontStack],e=t&&t[g];if(!e)continue;b=e.metrics;}x=(a-y.scale)*kl;}I?(e.verticalizable=!0,w.push({glyph:g,imageName:S,x:f,y:d+x,vertical:I,scale:y.scale,fontStack:y.fontStack,sectionIndex:m,metrics:b,rect:A}),f+=k*y.scale+c):(w.push({glyph:g,imageName:S,x:f,y:d+x,vertical:I,scale:y.scale,fontStack:y.fontStack,sectionIndex:m,metrics:b,rect:A}),f+=b.advance*y.scale+c);}0!==w.length&&(y=Math.max(f-c,y),xu(w,0,w.length-1,g,_)),f=0;const A=s*a+_;b.lineOffset=Math.max(_,l),d+=A,m=Math.max(A,m),++x;}var v;const b=d-au,{horizontalAlign:w,verticalAlign:_}=gu(o);(((function(t,e,r,n,i,a,s,o,l){const u=(e-r)*i;let c=0;c=a!==s?-o*n-au:(-n*l+.5)*s;for(const e of t)for(const t of e.positionedGlyphs)t.x+=u,t.y+=c;})))(e.positionedLines,g,w,_,y,m,s,b,a.length),e.top+=-_*b,e.bottom=e.top+b,e.left+=-w*y,e.right=e.left+y;}(_,r,n,i,x,o,l,u,p,c,f,m),!function(t){for(const e of t)if(0!==e.positionedGlyphs.length)return !1;return !0}(w)&&_}const uu={9:!0,10:!0,11:!0,12:!0,13:!0,32:!0},cu={10:!0,32:!0,38:!0,40:!0,41:!0,43:!0,45:!0,47:!0,173:!0,183:!0,8203:!0,8208:!0,8211:!0,8231:!0};function hu(t,e,r,n,i,a){if(e.imageName){const t=n[e.imageName];return t?t.displaySize[0]*e.scale*kl/a+i:0}{const n=r[e.fontStack],a=n&&n[t];return a?a.metrics.advance*e.scale+i:0}}function pu(t,e,r,n){const i=Math.pow(t-e,2);return n?t<e?i/2:2*i:i+Math.abs(r)*r}function fu(t,e,r){let n=0;return 10===t&&(n-=1e4),r&&(n+=150),40!==t&&65288!==t||(n+=50),41!==e&&65289!==e||(n+=50),n}function du(t,e,r,n,i,a){let s=null,o=pu(e,r,i,a);for(const t of n){const n=pu(e-t.x,r,i,a)+t.badness;n<=o&&(s=t,o=n);}return {index:t,x:e,priorBreak:s,badness:o}}function yu(t){return t?yu(t.priorBreak).concat(t.index):[]}function mu(t,e,r,n,i,a,s){if("point"!==a)return [];if(!t)return [];const o=[],l=function(t,e,r,n,i,a){let s=0;for(let r=0;r<t.length();r++){const o=t.getSection(r);s+=hu(t.getCharCode(r),o,n,i,e,a);}return s/Math.max(1,Math.ceil(s/r))}(t,e,r,n,i,s),u=t.text.indexOf("​")>=0;let c=0;for(let r=0;r<t.length();r++){const a=t.getSection(r),p=t.getCharCode(r);if(uu[p]||(c+=hu(p,a,n,i,e,s)),r<t.length()-1){const e=!((h=p)<11904||!(Tn["Bopomofo Extended"](h)||Tn.Bopomofo(h)||Tn["CJK Compatibility Forms"](h)||Tn["CJK Compatibility Ideographs"](h)||Tn["CJK Compatibility"](h)||Tn["CJK Radicals Supplement"](h)||Tn["CJK Strokes"](h)||Tn["CJK Symbols and Punctuation"](h)||Tn["CJK Unified Ideographs Extension A"](h)||Tn["CJK Unified Ideographs"](h)||Tn["Enclosed CJK Letters and Months"](h)||Tn["Halfwidth and Fullwidth Forms"](h)||Tn.Hiragana(h)||Tn["Ideographic Description Characters"](h)||Tn["Kangxi Radicals"](h)||Tn["Katakana Phonetic Extensions"](h)||Tn.Katakana(h)||Tn["Vertical Forms"](h)||Tn["Yi Radicals"](h)||Tn["Yi Syllables"](h)));(cu[p]||e||a.imageName)&&o.push(du(r+1,c,l,o,fu(p,t.getCharCode(r+1),e&&u),!1));}}var h;return yu(du(t.length(),c,l,o,0,!0))}function gu(t){let e=.5,r=.5;switch(t){case"right":case"top-right":case"bottom-right":e=1;break;case"left":case"top-left":case"bottom-left":e=0;}switch(t){case"bottom":case"bottom-right":case"bottom-left":r=1;break;case"top":case"top-right":case"top-left":r=0;}return {horizontalAlign:e,verticalAlign:r}}function xu(t,e,r,n,i){if(!n&&!i)return;const a=t[r],s=(t[r].x+a.metrics.advance*a.scale)*n;for(let n=e;n<=r;n++)t[n].x-=s,t[n].y+=i;}function vu(t,e,r){const{horizontalAlign:n,verticalAlign:i}=gu(r),a=e[0]-t.displaySize[0]*n,s=e[1]-t.displaySize[1]*i;return {image:t,top:s,bottom:s+t.displaySize[1],left:a,right:a+t.displaySize[0]}}function bu(t,e,r,n,i,a){const s=t.image;let o;if(s.content){const t=s.content,e=s.pixelRatio||1;o=[t[0]/e,t[1]/e,s.displaySize[0]-t[2]/e,s.displaySize[1]-t[3]/e];}const l=e.left*a,u=e.right*a;let c,h,p,f;"width"===r||"both"===r?(f=i[0]+l-n[3],h=i[0]+u+n[1]):(f=i[0]+(l+u-s.displaySize[0])/2,h=f+s.displaySize[0]);const d=e.top*a,y=e.bottom*a;return "height"===r||"both"===r?(c=i[1]+d-n[0],p=i[1]+y+n[2]):(c=i[1]+(d+y-s.displaySize[1])/2,p=c+s.displaySize[1]),{image:s,top:c,right:h,bottom:p,left:f,collisionPadding:o}}const wu=255,_u=128,Au=wu*_u;function Su(t,e){const{expression:r}=e;if("constant"===r.kind)return {kind:"constant",layoutSize:r.evaluate(new ei(t+1))};if("source"===r.kind)return {kind:"source"};{const{zoomStops:e,interpolationType:n}=r;let i=0;for(;i<e.length&&e[i]<=t;)i++;i=Math.max(0,i-1);let a=i;for(;a<e.length&&e[a]<t+1;)a++;a=Math.min(e.length-1,a);const s=e[i],o=e[a];return "composite"===r.kind?{kind:"composite",minZoom:s,maxZoom:o,interpolationType:n}:{kind:"camera",minZoom:s,maxZoom:o,minSize:r.evaluate(new ei(s)),maxSize:r.evaluate(new ei(o)),interpolationType:n}}}function ku(t,e,r){let n="never";const i=t.get(e);return i?n=i:t.get(r)&&(n="always"),n}const Iu=To.VectorTileFeature.types,zu=[{name:"a_fade_opacity",components:1,type:"Uint8",offset:0}];function Mu(t,e,r,n,i,a,s,o,l,u,c,h,p){const f=o?Math.min(Au,Math.round(o[0])):0,d=o?Math.min(Au,Math.round(o[1])):0;t.emplaceBack(e,r,Math.round(32*n),Math.round(32*i),a,s,(f<<1)+(l?1:0),d,16*u,16*c,256*h,256*p);}function Pu(t,e,r){t.emplaceBack(e.x,e.y,r),t.emplaceBack(e.x,e.y,r),t.emplaceBack(e.x,e.y,r),t.emplaceBack(e.x,e.y,r);}function Bu(t){for(const e of t.sections)if(qn(e.text))return !0;return !1}class Cu{constructor(t){this.layoutVertexArray=new ha,this.indexArray=new ma,this.programConfigurations=t,this.segments=new ba,this.dynamicLayoutVertexArray=new pa,this.opacityVertexArray=new fa,this.hasVisibleVertices=!1,this.placedSymbolArray=new Xi;}isEmpty(){return 0===this.layoutVertexArray.length&&0===this.indexArray.length&&0===this.dynamicLayoutVertexArray.length&&0===this.opacityVertexArray.length}upload(t,e,r,n){this.isEmpty()||(r&&(this.layoutVertexBuffer=t.createVertexBuffer(this.layoutVertexArray,xl.members),this.indexBuffer=t.createIndexBuffer(this.indexArray,e),this.dynamicLayoutVertexBuffer=t.createVertexBuffer(this.dynamicLayoutVertexArray,vl.members,!0),this.opacityVertexBuffer=t.createVertexBuffer(this.opacityVertexArray,zu,!0),this.opacityVertexBuffer.itemSize=1),(r||n)&&this.programConfigurations.upload(t));}destroy(){this.layoutVertexBuffer&&(this.layoutVertexBuffer.destroy(),this.indexBuffer.destroy(),this.programConfigurations.destroy(),this.segments.destroy(),this.dynamicLayoutVertexBuffer.destroy(),this.opacityVertexBuffer.destroy());}}Pn("SymbolBuffers",Cu);class Vu{constructor(t,e,r){this.layoutVertexArray=new t,this.layoutAttributes=e,this.indexArray=new r,this.segments=new ba,this.collisionVertexArray=new ya;}upload(t){this.layoutVertexBuffer=t.createVertexBuffer(this.layoutVertexArray,this.layoutAttributes),this.indexBuffer=t.createIndexBuffer(this.indexArray),this.collisionVertexBuffer=t.createVertexBuffer(this.collisionVertexArray,bl.members,!0);}destroy(){this.layoutVertexBuffer&&(this.layoutVertexBuffer.destroy(),this.indexBuffer.destroy(),this.segments.destroy(),this.collisionVertexBuffer.destroy());}}Pn("CollisionBuffers",Vu);class Eu{constructor(e){this.collisionBoxArray=e.collisionBoxArray,this.zoom=e.zoom,this.overscaling=e.overscaling,this.layers=e.layers,this.layerIds=this.layers.map((t=>t.id)),this.index=e.index,this.pixelRatio=e.pixelRatio,this.sourceLayerIndex=e.sourceLayerIndex,this.hasPattern=!1,this.hasRTLText=!1,this.sortKeyRanges=[],this.collisionCircleArray=[],this.placementInvProjMatrix=ws([]),this.placementViewportMatrix=ws([]);const r=this.layers[0]._unevaluatedLayout._values;this.textSizeData=Su(this.zoom,r["text-size"]),this.iconSizeData=Su(this.zoom,r["icon-size"]);const n=this.layers[0].layout,i=n.get("symbol-sort-key"),a=n.get("symbol-z-order");this.canOverlap="never"!==ku(n,"text-overlap","text-allow-overlap")||"never"!==ku(n,"icon-overlap","icon-allow-overlap")||n.get("text-ignore-placement")||n.get("icon-ignore-placement"),this.sortFeaturesByKey="viewport-y"!==a&&!i.isConstant(),this.sortFeaturesByY=("viewport-y"===a||"auto"===a&&!this.sortFeaturesByKey)&&this.canOverlap,"point"===n.get("symbol-placement")&&(this.writingModes=n.get("text-writing-mode").map((e=>t.WritingMode[e]))),this.stateDependentLayerIds=this.layers.filter((t=>t.isStateDependent())).map((t=>t.id)),this.sourceID=e.sourceID;}createArrays(){this.text=new Cu(new Ka(this.layers,this.zoom,(t=>/^text/.test(t)))),this.icon=new Cu(new Ka(this.layers,this.zoom,(t=>/^icon/.test(t)))),this.glyphOffsetArray=new Wi,this.lineVertexArray=new Qi,this.symbolInstances=new Hi,this.textAnchorOffsets=new ea;}calculateGlyphDependencies(t,e,r,n,i){for(let a=0;a<t.length;a++)if(e[t.charCodeAt(a)]=!0,(r||n)&&i){const r=Sl[t.charAt(a)];r&&(e[r.charCodeAt(0)]=!0);}}populate(e,r,n){const i=this.layers[0],a=i.layout,s=a.get("text-font"),o=a.get("text-field"),l=a.get("icon-image"),u=("constant"!==o.value.kind||o.value.value instanceof Kt&&!o.value.value.isEmpty()||o.value.value.toString().length>0)&&("constant"!==s.value.kind||s.value.value.length>0),c="constant"!==l.value.kind||!!l.value.value||Object.keys(l.parameters).length>0,h=a.get("symbol-sort-key");if(this.features=[],!u&&!c)return;const p=r.iconDependencies,f=r.glyphDependencies,d=r.availableImages,y=new ei(this.zoom);for(const{feature:r,id:o,index:l,sourceLayerIndex:m}of e){const e=i._featureFilter.needGeometry,g=Qa(r,e);if(!i._featureFilter.filter(y,g,n))continue;let x,v;if(e||(g.geometry=Wa(r)),u){const t=i.getValueAndResolveTokens("text-field",g,n,d),e=Kt.factory(t);Bu(e)&&(this.hasRTLText=!0),(!this.hasRTLText||"unavailable"===Wn()||this.hasRTLText&&ti.isParsed())&&(x=Al(e,i,g));}if(c){const t=i.getValueAndResolveTokens("icon-image",g,n,d);v=t instanceof Yt?t:Yt.fromString(t);}if(!x&&!v)continue;const b=this.sortFeaturesByKey?h.evaluate(g,{},n):void 0;if(this.features.push({id:o,text:x,icon:v,index:l,sourceLayerIndex:m,geometry:g.geometry,properties:r.properties,type:Iu[r.type],sortKey:b}),v&&(p[v.name]=!0),x){const e=s.evaluate(g,{},n).join(","),r="viewport"!==a.get("text-rotation-alignment")&&"point"!==a.get("symbol-placement");this.allowVerticalPlacement=this.writingModes&&this.writingModes.indexOf(t.WritingMode.vertical)>=0;for(const t of x.sections)if(t.image)p[t.image.name]=!0;else {const n=Fn(x.toString()),i=t.fontStack||e,a=f[i]=f[i]||{};this.calculateGlyphDependencies(t.text,a,r,this.allowVerticalPlacement,n);}}}"line"===a.get("symbol-placement")&&(this.features=function(t){const e={},r={},n=[];let i=0;function a(e){n.push(t[e]),i++;}function s(t,e,i){const a=r[t];return delete r[t],r[e]=a,n[a].geometry[0].pop(),n[a].geometry[0]=n[a].geometry[0].concat(i[0]),a}function o(t,r,i){const a=e[r];return delete e[r],e[t]=a,n[a].geometry[0].shift(),n[a].geometry[0]=i[0].concat(n[a].geometry[0]),a}function l(t,e,r){const n=r?e[0][e[0].length-1]:e[0][0];return `${t}:${n.x}:${n.y}`}for(let u=0;u<t.length;u++){const c=t[u],h=c.geometry,p=c.text?c.text.toString():null;if(!p){a(u);continue}const f=l(p,h),d=l(p,h,!0);if(f in r&&d in e&&r[f]!==e[d]){const t=o(f,d,h),i=s(f,d,n[t].geometry);delete e[f],delete r[d],r[l(p,n[i].geometry,!0)]=i,n[t].geometry=null;}else f in r?s(f,d,h):d in e?o(f,d,h):(a(u),e[f]=i-1,r[d]=i-1);}return n.filter((t=>t.geometry))}(this.features)),this.sortFeaturesByKey&&this.features.sort(((t,e)=>t.sortKey-e.sortKey));}update(t,e,r){this.stateDependentLayers.length&&(this.text.programConfigurations.updatePaintArrays(t,e,this.layers,r),this.icon.programConfigurations.updatePaintArrays(t,e,this.layers,r));}isEmpty(){return 0===this.symbolInstances.length&&!this.hasRTLText}uploadPending(){return !this.uploaded||this.text.programConfigurations.needsUpload||this.icon.programConfigurations.needsUpload}upload(t){!this.uploaded&&this.hasDebugData()&&(this.textCollisionBox.upload(t),this.iconCollisionBox.upload(t)),this.text.upload(t,this.sortFeaturesByY,!this.uploaded,this.text.programConfigurations.needsUpload),this.icon.upload(t,this.sortFeaturesByY,!this.uploaded,this.icon.programConfigurations.needsUpload),this.uploaded=!0;}destroyDebugData(){this.textCollisionBox.destroy(),this.iconCollisionBox.destroy();}destroy(){this.text.destroy(),this.icon.destroy(),this.hasDebugData()&&this.destroyDebugData();}addToLineVertexArray(t,e){const r=this.lineVertexArray.length;if(void 0!==t.segment){let r=t.dist(e[t.segment+1]),n=t.dist(e[t.segment]);const i={};for(let n=t.segment+1;n<e.length;n++)i[n]={x:e[n].x,y:e[n].y,tileUnitDistanceFromAnchor:r},n<e.length-1&&(r+=e[n+1].dist(e[n]));for(let r=t.segment||0;r>=0;r--)i[r]={x:e[r].x,y:e[r].y,tileUnitDistanceFromAnchor:n},r>0&&(n+=e[r-1].dist(e[r]));for(let t=0;t<e.length;t++){const e=i[t];this.lineVertexArray.emplaceBack(e.x,e.y,e.tileUnitDistanceFromAnchor);}}return {lineStartIndex:r,lineLength:this.lineVertexArray.length-r}}addSymbols(e,r,n,i,a,s,o,l,u,c,h,p){const f=e.indexArray,d=e.layoutVertexArray,y=e.segments.prepareSegment(4*r.length,d,f,this.canOverlap?s.sortKey:void 0),m=this.glyphOffsetArray.length,g=y.vertexLength,x=this.allowVerticalPlacement&&o===t.WritingMode.vertical?Math.PI/2:0,v=s.text&&s.text.sections;for(let t=0;t<r.length;t++){const{tl:i,tr:a,bl:o,br:u,tex:c,pixelOffsetTL:h,pixelOffsetBR:m,minFontScaleX:g,minFontScaleY:b,glyphOffset:w,isSDF:_,sectionIndex:A}=r[t],S=y.vertexLength,k=w[1];Mu(d,l.x,l.y,i.x,k+i.y,c.x,c.y,n,_,h.x,h.y,g,b),Mu(d,l.x,l.y,a.x,k+a.y,c.x+c.w,c.y,n,_,m.x,h.y,g,b),Mu(d,l.x,l.y,o.x,k+o.y,c.x,c.y+c.h,n,_,h.x,m.y,g,b),Mu(d,l.x,l.y,u.x,k+u.y,c.x+c.w,c.y+c.h,n,_,m.x,m.y,g,b),Pu(e.dynamicLayoutVertexArray,l,x),f.emplaceBack(S,S+1,S+2),f.emplaceBack(S+1,S+2,S+3),y.vertexLength+=4,y.primitiveLength+=2,this.glyphOffsetArray.emplaceBack(w[0]),t!==r.length-1&&A===r[t+1].sectionIndex||e.programConfigurations.populatePaintArrays(d.length,s,s.index,{},p,v&&v[A]);}e.placedSymbolArray.emplaceBack(l.x,l.y,m,this.glyphOffsetArray.length-m,g,u,c,l.segment,n?n[0]:0,n?n[1]:0,i[0],i[1],o,0,!1,0,h);}_addCollisionDebugVertex(t,e,r,n,i,a){return e.emplaceBack(0,0),t.emplaceBack(r.x,r.y,n,i,Math.round(a.x),Math.round(a.y))}addCollisionDebugVertices(t,e,r,n,a,s,o){const l=a.segments.prepareSegment(4,a.layoutVertexArray,a.indexArray),u=l.vertexLength,c=a.layoutVertexArray,h=a.collisionVertexArray,p=o.anchorX,f=o.anchorY;this._addCollisionDebugVertex(c,h,s,p,f,new i(t,e)),this._addCollisionDebugVertex(c,h,s,p,f,new i(r,e)),this._addCollisionDebugVertex(c,h,s,p,f,new i(r,n)),this._addCollisionDebugVertex(c,h,s,p,f,new i(t,n)),l.vertexLength+=4;const d=a.indexArray;d.emplaceBack(u,u+1),d.emplaceBack(u+1,u+2),d.emplaceBack(u+2,u+3),d.emplaceBack(u+3,u),l.primitiveLength+=4;}addDebugCollisionBoxes(t,e,r,n){for(let i=t;i<e;i++){const t=this.collisionBoxArray.get(i);this.addCollisionDebugVertices(t.x1,t.y1,t.x2,t.y2,n?this.textCollisionBox:this.iconCollisionBox,t.anchorPoint,r);}}generateCollisionDebugBuffers(){this.hasDebugData()&&this.destroyDebugData(),this.textCollisionBox=new Vu(da,wl.members,ga),this.iconCollisionBox=new Vu(da,wl.members,ga);for(let t=0;t<this.symbolInstances.length;t++){const e=this.symbolInstances.get(t);this.addDebugCollisionBoxes(e.textBoxStartIndex,e.textBoxEndIndex,e,!0),this.addDebugCollisionBoxes(e.verticalTextBoxStartIndex,e.verticalTextBoxEndIndex,e,!0),this.addDebugCollisionBoxes(e.iconBoxStartIndex,e.iconBoxEndIndex,e,!1),this.addDebugCollisionBoxes(e.verticalIconBoxStartIndex,e.verticalIconBoxEndIndex,e,!1);}}_deserializeCollisionBoxesForSymbol(t,e,r,n,i,a,s,o,l){const u={};for(let n=e;n<r;n++){const e=t.get(n);u.textBox={x1:e.x1,y1:e.y1,x2:e.x2,y2:e.y2,anchorPointX:e.anchorPointX,anchorPointY:e.anchorPointY},u.textFeatureIndex=e.featureIndex;break}for(let e=n;e<i;e++){const r=t.get(e);u.verticalTextBox={x1:r.x1,y1:r.y1,x2:r.x2,y2:r.y2,anchorPointX:r.anchorPointX,anchorPointY:r.anchorPointY},u.verticalTextFeatureIndex=r.featureIndex;break}for(let e=a;e<s;e++){const r=t.get(e);u.iconBox={x1:r.x1,y1:r.y1,x2:r.x2,y2:r.y2,anchorPointX:r.anchorPointX,anchorPointY:r.anchorPointY},u.iconFeatureIndex=r.featureIndex;break}for(let e=o;e<l;e++){const r=t.get(e);u.verticalIconBox={x1:r.x1,y1:r.y1,x2:r.x2,y2:r.y2,anchorPointX:r.anchorPointX,anchorPointY:r.anchorPointY},u.verticalIconFeatureIndex=r.featureIndex;break}return u}deserializeCollisionBoxes(t){this.collisionArrays=[];for(let e=0;e<this.symbolInstances.length;e++){const r=this.symbolInstances.get(e);this.collisionArrays.push(this._deserializeCollisionBoxesForSymbol(t,r.textBoxStartIndex,r.textBoxEndIndex,r.verticalTextBoxStartIndex,r.verticalTextBoxEndIndex,r.iconBoxStartIndex,r.iconBoxEndIndex,r.verticalIconBoxStartIndex,r.verticalIconBoxEndIndex));}}hasTextData(){return this.text.segments.get().length>0}hasIconData(){return this.icon.segments.get().length>0}hasDebugData(){return this.textCollisionBox&&this.iconCollisionBox}hasTextCollisionBoxData(){return this.hasDebugData()&&this.textCollisionBox.segments.get().length>0}hasIconCollisionBoxData(){return this.hasDebugData()&&this.iconCollisionBox.segments.get().length>0}addIndicesForPlacedSymbol(t,e){const r=t.placedSymbolArray.get(e),n=r.vertexStartIndex+4*r.numGlyphs;for(let e=r.vertexStartIndex;e<n;e+=4)t.indexArray.emplaceBack(e,e+1,e+2),t.indexArray.emplaceBack(e+1,e+2,e+3);}getSortedSymbolIndexes(t){if(this.sortedAngle===t&&void 0!==this.symbolInstanceIndexes)return this.symbolInstanceIndexes;const e=Math.sin(t),r=Math.cos(t),n=[],i=[],a=[];for(let t=0;t<this.symbolInstances.length;++t){a.push(t);const s=this.symbolInstances.get(t);n.push(0|Math.round(e*s.anchorX+r*s.anchorY)),i.push(s.featureIndex);}return a.sort(((t,e)=>n[t]-n[e]||i[e]-i[t])),a}addToSortKeyRanges(t,e){const r=this.sortKeyRanges[this.sortKeyRanges.length-1];r&&r.sortKey===e?r.symbolInstanceEnd=t+1:this.sortKeyRanges.push({sortKey:e,symbolInstanceStart:t,symbolInstanceEnd:t+1});}sortFeatures(t){if(this.sortFeaturesByY&&this.sortedAngle!==t&&!(this.text.segments.get().length>1||this.icon.segments.get().length>1)){this.symbolInstanceIndexes=this.getSortedSymbolIndexes(t),this.sortedAngle=t,this.text.indexArray.clear(),this.icon.indexArray.clear(),this.featureSortOrder=[];for(const t of this.symbolInstanceIndexes){const e=this.symbolInstances.get(t);this.featureSortOrder.push(e.featureIndex),[e.rightJustifiedTextSymbolIndex,e.centerJustifiedTextSymbolIndex,e.leftJustifiedTextSymbolIndex].forEach(((t,e,r)=>{t>=0&&r.indexOf(t)===e&&this.addIndicesForPlacedSymbol(this.text,t);})),e.verticalPlacedTextSymbolIndex>=0&&this.addIndicesForPlacedSymbol(this.text,e.verticalPlacedTextSymbolIndex),e.placedIconSymbolIndex>=0&&this.addIndicesForPlacedSymbol(this.icon,e.placedIconSymbolIndex),e.verticalPlacedIconSymbolIndex>=0&&this.addIndicesForPlacedSymbol(this.icon,e.verticalPlacedIconSymbolIndex);}this.text.indexBuffer&&this.text.indexBuffer.updateData(this.text.indexArray),this.icon.indexBuffer&&this.icon.indexBuffer.updateData(this.icon.indexArray);}}}let Tu,Fu;Pn("SymbolBucket",Eu,{omit:["layers","collisionBoxArray","features","compareText"]}),Eu.MAX_GLYPHS=65535,Eu.addDynamicAttributes=Pu;var Lu={get paint(){return Fu=Fu||new yi({"icon-opacity":new hi(q.paint_symbol["icon-opacity"]),"icon-color":new hi(q.paint_symbol["icon-color"]),"icon-halo-color":new hi(q.paint_symbol["icon-halo-color"]),"icon-halo-width":new hi(q.paint_symbol["icon-halo-width"]),"icon-halo-blur":new hi(q.paint_symbol["icon-halo-blur"]),"icon-translate":new ci(q.paint_symbol["icon-translate"]),"icon-translate-anchor":new ci(q.paint_symbol["icon-translate-anchor"]),"text-opacity":new hi(q.paint_symbol["text-opacity"]),"text-color":new hi(q.paint_symbol["text-color"],{runtimeType:lt,getOverride:t=>t.textColor,hasOverride:t=>!!t.textColor}),"text-halo-color":new hi(q.paint_symbol["text-halo-color"]),"text-halo-width":new hi(q.paint_symbol["text-halo-width"]),"text-halo-blur":new hi(q.paint_symbol["text-halo-blur"]),"text-translate":new ci(q.paint_symbol["text-translate"]),"text-translate-anchor":new ci(q.paint_symbol["text-translate-anchor"])})},get layout(){return Tu=Tu||new yi({"symbol-placement":new ci(q.layout_symbol["symbol-placement"]),"symbol-spacing":new ci(q.layout_symbol["symbol-spacing"]),"symbol-avoid-edges":new ci(q.layout_symbol["symbol-avoid-edges"]),"symbol-sort-key":new hi(q.layout_symbol["symbol-sort-key"]),"symbol-z-order":new ci(q.layout_symbol["symbol-z-order"]),"icon-allow-overlap":new ci(q.layout_symbol["icon-allow-overlap"]),"icon-overlap":new ci(q.layout_symbol["icon-overlap"]),"icon-ignore-placement":new ci(q.layout_symbol["icon-ignore-placement"]),"icon-optional":new ci(q.layout_symbol["icon-optional"]),"icon-rotation-alignment":new ci(q.layout_symbol["icon-rotation-alignment"]),"icon-size":new hi(q.layout_symbol["icon-size"]),"icon-text-fit":new ci(q.layout_symbol["icon-text-fit"]),"icon-text-fit-padding":new ci(q.layout_symbol["icon-text-fit-padding"]),"icon-image":new hi(q.layout_symbol["icon-image"]),"icon-rotate":new hi(q.layout_symbol["icon-rotate"]),"icon-padding":new hi(q.layout_symbol["icon-padding"]),"icon-keep-upright":new ci(q.layout_symbol["icon-keep-upright"]),"icon-offset":new hi(q.layout_symbol["icon-offset"]),"icon-anchor":new hi(q.layout_symbol["icon-anchor"]),"icon-pitch-alignment":new ci(q.layout_symbol["icon-pitch-alignment"]),"text-pitch-alignment":new ci(q.layout_symbol["text-pitch-alignment"]),"text-rotation-alignment":new ci(q.layout_symbol["text-rotation-alignment"]),"text-field":new hi(q.layout_symbol["text-field"]),"text-font":new hi(q.layout_symbol["text-font"]),"text-size":new hi(q.layout_symbol["text-size"]),"text-max-width":new hi(q.layout_symbol["text-max-width"]),"text-line-height":new ci(q.layout_symbol["text-line-height"]),"text-letter-spacing":new hi(q.layout_symbol["text-letter-spacing"]),"text-justify":new hi(q.layout_symbol["text-justify"]),"text-radial-offset":new hi(q.layout_symbol["text-radial-offset"]),"text-variable-anchor":new ci(q.layout_symbol["text-variable-anchor"]),"text-variable-anchor-offset":new hi(q.layout_symbol["text-variable-anchor-offset"]),"text-anchor":new hi(q.layout_symbol["text-anchor"]),"text-max-angle":new ci(q.layout_symbol["text-max-angle"]),"text-writing-mode":new ci(q.layout_symbol["text-writing-mode"]),"text-rotate":new hi(q.layout_symbol["text-rotate"]),"text-padding":new ci(q.layout_symbol["text-padding"]),"text-keep-upright":new ci(q.layout_symbol["text-keep-upright"]),"text-transform":new hi(q.layout_symbol["text-transform"]),"text-offset":new hi(q.layout_symbol["text-offset"]),"text-allow-overlap":new ci(q.layout_symbol["text-allow-overlap"]),"text-overlap":new ci(q.layout_symbol["text-overlap"]),"text-ignore-placement":new ci(q.layout_symbol["text-ignore-placement"]),"text-optional":new ci(q.layout_symbol["text-optional"])})}};class $u{constructor(t){if(void 0===t.property.overrides)throw new Error("overrides must be provided to instantiate FormatSectionOverride class");this.type=t.property.overrides?t.property.overrides.runtimeType:it,this.defaultValue=t;}evaluate(t){if(t.formattedSection){const e=this.defaultValue.property.overrides;if(e&&e.hasOverride(t.formattedSection))return e.getOverride(t.formattedSection)}return t.feature&&t.featureState?this.defaultValue.evaluate(t.feature,t.featureState):this.defaultValue.property.specification.default}eachChild(t){this.defaultValue.isConstant()||t(this.defaultValue.value._styleExpression.expression);}outputDefined(){return !1}serialize(){return null}}Pn("FormatSectionOverride",$u,{omit:["defaultValue"]});class Du extends gi{constructor(t){super(t,Lu);}recalculate(t,e){if(super.recalculate(t,e),"auto"===this.layout.get("icon-rotation-alignment")&&(this.layout._values["icon-rotation-alignment"]="point"!==this.layout.get("symbol-placement")?"map":"viewport"),"auto"===this.layout.get("text-rotation-alignment")&&(this.layout._values["text-rotation-alignment"]="point"!==this.layout.get("symbol-placement")?"map":"viewport"),"auto"===this.layout.get("text-pitch-alignment")&&(this.layout._values["text-pitch-alignment"]="map"===this.layout.get("text-rotation-alignment")?"map":"viewport"),"auto"===this.layout.get("icon-pitch-alignment")&&(this.layout._values["icon-pitch-alignment"]=this.layout.get("icon-rotation-alignment")),"point"===this.layout.get("symbol-placement")){const t=this.layout.get("text-writing-mode");if(t){const e=[];for(const r of t)e.indexOf(r)<0&&e.push(r);this.layout._values["text-writing-mode"]=e;}else this.layout._values["text-writing-mode"]=["horizontal"];}this._setPaintOverrides();}getValueAndResolveTokens(t,e,r,n){const i=this.layout.get(t).evaluate(e,{},r,n),a=this._unevaluatedLayout._values[t];return a.isDataDriven()||Mr(a.value)||!i?i:function(t,e){return e.replace(/{([^{}]+)}/g,((e,r)=>r in t?String(t[r]):""))}(e.properties,i)}createBucket(t){return new Eu(t)}queryRadius(){return 0}queryIntersectsFeature(){throw new Error("Should take a different path in FeatureIndex")}_setPaintOverrides(){for(const t of Lu.paint.overridableProperties){if(!Du.hasPaintOverride(this.layout,t))continue;const e=this.paint.get(t),r=new $u(e),n=new zr(r,e.property.specification);let i=null;i="constant"===e.value.kind||"source"===e.value.kind?new Br("source",n):new Cr("composite",n,e.value.zoomStops),this.paint._values[t]=new li(e.property,i,e.parameters);}}_handleOverridablePaintPropertyUpdate(t,e,r){return !(!this.layout||e.isDataDriven()||r.isDataDriven())&&Du.hasPaintOverride(this.layout,t)}static hasPaintOverride(t,e){const r=t.get("text-field"),n=Lu.paint.properties[e];let i=!1;const a=t=>{for(const e of t)if(n.overrides&&n.overrides.hasOverride(e))return void(i=!0)};if("constant"===r.value.kind&&r.value.value instanceof Kt)a(r.value.value.sections);else if("source"===r.value.kind){const t=e=>{i||(e instanceof ee&&Qt(e.value)===pt?a(e.value.sections):e instanceof ar?a(e.sections):e.eachChild(t));},e=r.value;e._styleExpression&&t(e._styleExpression.expression);}return i}}let Ou;var Uu={get paint(){return Ou=Ou||new yi({"background-color":new ci(q.paint_background["background-color"]),"background-pattern":new fi(q.paint_background["background-pattern"]),"background-opacity":new ci(q.paint_background["background-opacity"])})}};class Ru extends gi{constructor(t){super(t,Uu);}}let qu;var ju={get paint(){return qu=qu||new yi({"raster-opacity":new ci(q.paint_raster["raster-opacity"]),"raster-hue-rotate":new ci(q.paint_raster["raster-hue-rotate"]),"raster-brightness-min":new ci(q.paint_raster["raster-brightness-min"]),"raster-brightness-max":new ci(q.paint_raster["raster-brightness-max"]),"raster-saturation":new ci(q.paint_raster["raster-saturation"]),"raster-contrast":new ci(q.paint_raster["raster-contrast"]),"raster-resampling":new ci(q.paint_raster["raster-resampling"]),"raster-fade-duration":new ci(q.paint_raster["raster-fade-duration"])})}};class Nu extends gi{constructor(t){super(t,ju);}}class Zu extends gi{constructor(t){super(t,{}),this.onAdd=t=>{this.implementation.onAdd&&this.implementation.onAdd(t,t.painter.context.gl);},this.onRemove=t=>{this.implementation.onRemove&&this.implementation.onRemove(t,t.painter.context.gl);},this.implementation=t;}is3D(){return "3d"===this.implementation.renderingMode}hasOffscreenPass(){return void 0!==this.implementation.prerender}recalculate(){}updateTransitions(){}hasTransition(){return !1}serialize(){throw new Error("Custom layers cannot be serialized")}}class Ku{constructor(t){this._callback=t,this._triggered=!1,"undefined"!=typeof MessageChannel&&(this._channel=new MessageChannel,this._channel.port2.onmessage=()=>{this._triggered=!1,this._callback();});}trigger(){this._triggered||(this._triggered=!0,this._channel?this._channel.port1.postMessage(!0):setTimeout((()=>{this._triggered=!1,this._callback();}),0));}remove(){delete this._channel,this._callback=()=>{};}}const Gu=6371008.8;class Ju{constructor(t,e){if(isNaN(t)||isNaN(e))throw new Error(`Invalid LngLat object: (${t}, ${e})`);if(this.lng=+t,this.lat=+e,this.lat>90||this.lat<-90)throw new Error("Invalid LngLat latitude value: must be between -90 and 90")}wrap(){return new Ju(h(this.lng,-180,180),this.lat)}toArray(){return [this.lng,this.lat]}toString(){return `LngLat(${this.lng}, ${this.lat})`}distanceTo(t){const e=Math.PI/180,r=this.lat*e,n=t.lat*e,i=Math.sin(r)*Math.sin(n)+Math.cos(r)*Math.cos(n)*Math.cos((t.lng-this.lng)*e);return Gu*Math.acos(Math.min(i,1))}static convert(t){if(t instanceof Ju)return t;if(Array.isArray(t)&&(2===t.length||3===t.length))return new Ju(Number(t[0]),Number(t[1]));if(!Array.isArray(t)&&"object"==typeof t&&null!==t)return new Ju(Number("lng"in t?t.lng:t.lon),Number(t.lat));throw new Error("`LngLatLike` argument must be specified as a LngLat instance, an object {lng: <lng>, lat: <lat>}, an object {lon: <lng>, lat: <lat>}, or an array of [<lng>, <lat>]")}}const Xu=2*Math.PI*Gu;function Yu(t){return Xu*Math.cos(t*Math.PI/180)}function Hu(t){return (180+t)/360}function Wu(t){return (180-180/Math.PI*Math.log(Math.tan(Math.PI/4+t*Math.PI/360)))/360}function Qu(t,e){return t/Yu(e)}function tc(t){return 360/Math.PI*Math.atan(Math.exp((180-360*t)*Math.PI/180))-90}class ec{constructor(t,e,r=0){this.x=+t,this.y=+e,this.z=+r;}static fromLngLat(t,e=0){const r=Ju.convert(t);return new ec(Hu(r.lng),Wu(r.lat),Qu(e,r.lat))}toLngLat(){return new Ju(360*this.x-180,tc(this.y))}toAltitude(){return this.z*Yu(tc(this.y))}meterInMercatorCoordinateUnits(){return 1/Xu*(t=tc(this.y),1/Math.cos(t*Math.PI/180));var t;}}function rc(t,e,r){var n=2*Math.PI*6378137/256/Math.pow(2,r);return [t*n-2*Math.PI*6378137/2,e*n-2*Math.PI*6378137/2]}class nc{constructor(t,e,r){if(t<0||t>25||r<0||r>=Math.pow(2,t)||e<0||e>=Math.pow(2,t))throw new Error(`x=${e}, y=${r}, z=${t} outside of bounds. 0<=x<${Math.pow(2,t)}, 0<=y<${Math.pow(2,t)} 0<=z<=25 `);this.z=t,this.x=e,this.y=r,this.key=sc(0,t,t,e,r);}equals(t){return this.z===t.z&&this.x===t.x&&this.y===t.y}url(t,e,r){const n=(a=this.y,s=this.z,o=rc(256*(i=this.x),256*(a=Math.pow(2,s)-a-1),s),l=rc(256*(i+1),256*(a+1),s),o[0]+","+o[1]+","+l[0]+","+l[1]);var i,a,s,o,l;const u=function(t,e,r){let n,i="";for(let a=t;a>0;a--)n=1<<a-1,i+=(e&n?1:0)+(r&n?2:0);return i}(this.z,this.x,this.y);return t[(this.x+this.y)%t.length].replace(/{prefix}/g,(this.x%16).toString(16)+(this.y%16).toString(16)).replace(/{z}/g,String(this.z)).replace(/{x}/g,String(this.x)).replace(/{y}/g,String("tms"===r?Math.pow(2,this.z)-this.y-1:this.y)).replace(/{ratio}/g,e>1?"@2x":"").replace(/{quadkey}/g,u).replace(/{bbox-epsg-3857}/g,n)}isChildOf(t){const e=this.z-t.z;return e>0&&t.x===this.x>>e&&t.y===this.y>>e}getTilePoint(t){const e=Math.pow(2,this.z);return new i((t.x*e-this.x)*Xa,(t.y*e-this.y)*Xa)}toString(){return `${this.z}/${this.x}/${this.y}`}}class ic{constructor(t,e){this.wrap=t,this.canonical=e,this.key=sc(t,e.z,e.z,e.x,e.y);}}class ac{constructor(t,e,r,n,i){if(t<r)throw new Error(`overscaledZ should be >= z; overscaledZ = ${t}; z = ${r}`);this.overscaledZ=t,this.wrap=e,this.canonical=new nc(r,+n,+i),this.key=sc(e,t,r,n,i);}clone(){return new ac(this.overscaledZ,this.wrap,this.canonical.z,this.canonical.x,this.canonical.y)}equals(t){return this.overscaledZ===t.overscaledZ&&this.wrap===t.wrap&&this.canonical.equals(t.canonical)}scaledTo(t){if(t>this.overscaledZ)throw new Error(`targetZ > this.overscaledZ; targetZ = ${t}; overscaledZ = ${this.overscaledZ}`);const e=this.canonical.z-t;return t>this.canonical.z?new ac(t,this.wrap,this.canonical.z,this.canonical.x,this.canonical.y):new ac(t,this.wrap,t,this.canonical.x>>e,this.canonical.y>>e)}calculateScaledKey(t,e){if(t>this.overscaledZ)throw new Error(`targetZ > this.overscaledZ; targetZ = ${t}; overscaledZ = ${this.overscaledZ}`);const r=this.canonical.z-t;return t>this.canonical.z?sc(this.wrap*+e,t,this.canonical.z,this.canonical.x,this.canonical.y):sc(this.wrap*+e,t,t,this.canonical.x>>r,this.canonical.y>>r)}isChildOf(t){if(t.wrap!==this.wrap)return !1;const e=this.canonical.z-t.canonical.z;return 0===t.overscaledZ||t.overscaledZ<this.overscaledZ&&t.canonical.x===this.canonical.x>>e&&t.canonical.y===this.canonical.y>>e}children(t){if(this.overscaledZ>=t)return [new ac(this.overscaledZ+1,this.wrap,this.canonical.z,this.canonical.x,this.canonical.y)];const e=this.canonical.z+1,r=2*this.canonical.x,n=2*this.canonical.y;return [new ac(e,this.wrap,e,r,n),new ac(e,this.wrap,e,r+1,n),new ac(e,this.wrap,e,r,n+1),new ac(e,this.wrap,e,r+1,n+1)]}isLessThan(t){return this.wrap<t.wrap||!(this.wrap>t.wrap)&&(this.overscaledZ<t.overscaledZ||!(this.overscaledZ>t.overscaledZ)&&(this.canonical.x<t.canonical.x||!(this.canonical.x>t.canonical.x)&&this.canonical.y<t.canonical.y))}wrapped(){return new ac(this.overscaledZ,0,this.canonical.z,this.canonical.x,this.canonical.y)}unwrapTo(t){return new ac(this.overscaledZ,t,this.canonical.z,this.canonical.x,this.canonical.y)}overscaleFactor(){return Math.pow(2,this.overscaledZ-this.canonical.z)}toUnwrapped(){return new ic(this.wrap,this.canonical)}toString(){return `${this.overscaledZ}/${this.canonical.x}/${this.canonical.y}`}getTilePoint(t){return this.canonical.getTilePoint(new ec(t.x-this.wrap,t.y))}}function sc(t,e,r,n,i){(t*=2)<0&&(t=-1*t-1);const a=1<<r;return (a*a*t+a*i+n).toString(36)+r.toString(36)+e.toString(36)}Pn("CanonicalTileID",nc),Pn("OverscaledTileID",ac,{omit:["posMatrix"]});class oc{constructor(t,e,r){if(this.uid=t,e.height!==e.width)throw new RangeError("DEM tiles must be square");if(r&&"mapbox"!==r&&"terrarium"!==r)return void x(`"${r}" is not a valid encoding type. Valid types include "mapbox" and "terrarium".`);this.stride=e.height;const n=this.dim=e.height-2;this.data=new Uint32Array(e.data.buffer),this.encoding=r||"mapbox";for(let t=0;t<n;t++)this.data[this._idx(-1,t)]=this.data[this._idx(0,t)],this.data[this._idx(n,t)]=this.data[this._idx(n-1,t)],this.data[this._idx(t,-1)]=this.data[this._idx(t,0)],this.data[this._idx(t,n)]=this.data[this._idx(t,n-1)];this.data[this._idx(-1,-1)]=this.data[this._idx(0,0)],this.data[this._idx(n,-1)]=this.data[this._idx(n-1,0)],this.data[this._idx(-1,n)]=this.data[this._idx(0,n-1)],this.data[this._idx(n,n)]=this.data[this._idx(n-1,n-1)],this.min=Number.MAX_SAFE_INTEGER,this.max=Number.MIN_SAFE_INTEGER;for(let t=0;t<n;t++)for(let e=0;e<n;e++){const r=this.get(t,e);r>this.max&&(this.max=r),r<this.min&&(this.min=r);}}get(t,e){const r=new Uint8Array(this.data.buffer),n=4*this._idx(t,e);return ("terrarium"===this.encoding?this._unpackTerrarium:this._unpackMapbox)(r[n],r[n+1],r[n+2])}getUnpackVector(){return "terrarium"===this.encoding?[256,1,1/256,32768]:[6553.6,25.6,.1,1e4]}_idx(t,e){if(t<-1||t>=this.dim+1||e<-1||e>=this.dim+1)throw new RangeError("out of range source coordinates for DEM data");return (e+1)*this.stride+(t+1)}_unpackMapbox(t,e,r){return (256*t*256+256*e+r)/10-1e4}_unpackTerrarium(t,e,r){return 256*t+e+r/256-32768}getPixels(){return new Fs({width:this.stride,height:this.stride},new Uint8Array(this.data.buffer))}backfillBorder(t,e,r){if(this.dim!==t.dim)throw new Error("dem dimension mismatch");let n=e*this.dim,i=e*this.dim+this.dim,a=r*this.dim,s=r*this.dim+this.dim;switch(e){case-1:n=i-1;break;case 1:i=n+1;}switch(r){case-1:a=s-1;break;case 1:s=a+1;}const o=-e*this.dim,l=-r*this.dim;for(let e=a;e<s;e++)for(let r=n;r<i;r++)this.data[this._idx(r,e)]=t.data[this._idx(r+o,e+l)];}}Pn("DEMData",oc);class lc{constructor(t){this._stringToNumber={},this._numberToString=[];for(let e=0;e<t.length;e++){const r=t[e];this._stringToNumber[r]=e,this._numberToString[e]=r;}}encode(t){return this._stringToNumber[t]}decode(t){if(t>=this._numberToString.length)throw new Error(`Out of bounds. Index requested n=${t} can't be >= this._numberToString.length ${this._numberToString.length}`);return this._numberToString[t]}}class uc{constructor(t,e,r,n,i){this.type="Feature",this._vectorTileFeature=t,t._z=e,t._x=r,t._y=n,this.properties=t.properties,this.id=i;}get geometry(){return void 0===this._geometry&&(this._geometry=this._vectorTileFeature.toGeoJSON(this._vectorTileFeature._x,this._vectorTileFeature._y,this._vectorTileFeature._z).geometry),this._geometry}set geometry(t){this._geometry=t;}toJSON(){const t={geometry:this.geometry};for(const e in this)"_geometry"!==e&&"_vectorTileFeature"!==e&&(t[e]=this[e]);return t}}class cc{constructor(t,e){this.tileID=t,this.x=t.canonical.x,this.y=t.canonical.y,this.z=t.canonical.z,this.grid=new zn(Xa,16,0),this.grid3D=new zn(Xa,16,0),this.featureIndexArray=new na,this.promoteId=e;}insert(t,e,r,n,i,a){const s=this.featureIndexArray.length;this.featureIndexArray.emplaceBack(r,n,i);const o=a?this.grid3D:this.grid;for(let t=0;t<e.length;t++){const r=e[t],n=[1/0,1/0,-1/0,-1/0];for(let t=0;t<r.length;t++){const e=r[t];n[0]=Math.min(n[0],e.x),n[1]=Math.min(n[1],e.y),n[2]=Math.max(n[2],e.x),n[3]=Math.max(n[3],e.y);}n[0]<Xa&&n[1]<Xa&&n[2]>=0&&n[3]>=0&&o.insert(s,n[0],n[1],n[2],n[3]);}}loadVTLayers(){return this.vtLayers||(this.vtLayers=new To.VectorTile(new Jl(this.rawTileData)).layers,this.sourceLayerCoder=new lc(this.vtLayers?Object.keys(this.vtLayers).sort():["_geojsonTileLayer"])),this.vtLayers}query(t,e,r,n){this.loadVTLayers();const a=t.params||{},s=Xa/t.tileSize/t.scale,o=$r(a.filter),l=t.queryGeometry,u=t.queryPadding*s,c=pc(l),h=this.grid.query(c.minX-u,c.minY-u,c.maxX+u,c.maxY+u),p=pc(t.cameraQueryGeometry),f=this.grid3D.query(p.minX-u,p.minY-u,p.maxX+u,p.maxY+u,((e,r,n,a)=>function(t,e,r,n,a){for(const i of t)if(e<=i.x&&r<=i.y&&n>=i.x&&a>=i.y)return !0;const s=[new i(e,r),new i(e,a),new i(n,a),new i(n,r)];if(t.length>2)for(const e of s)if(hs(t,e))return !0;for(let e=0;e<t.length-1;e++)if(ps(t[e],t[e+1],s))return !0;return !1}(t.cameraQueryGeometry,e-u,r-u,n+u,a+u)));for(const t of f)h.push(t);h.sort(fc);const d={};let y;for(let i=0;i<h.length;i++){const u=h[i];if(u===y)continue;y=u;const c=this.featureIndexArray.get(u);let p=null;this.loadMatchingFeature(d,c.bucketIndex,c.sourceLayerIndex,c.featureIndex,o,a.layers,a.availableImages,e,r,n,((e,r,n)=>(p||(p=Wa(e)),r.queryIntersectsFeature(l,e,n,p,this.z,t.transform,s,t.pixelPosMatrix))));}return d}loadMatchingFeature(t,e,r,n,i,a,s,o,l,u,c){const h=this.bucketLayerIDs[e];if(a&&!function(t,e){for(let r=0;r<t.length;r++)if(e.indexOf(t[r])>=0)return !0;return !1}(a,h))return;const f=this.sourceLayerCoder.decode(r),d=this.vtLayers[f].feature(n);if(i.needGeometry){const t=Qa(d,!0);if(!i.filter(new ei(this.tileID.overscaledZ),t,this.tileID.canonical))return}else if(!i.filter(new ei(this.tileID.overscaledZ),d))return;const y=this.getId(d,f);for(let e=0;e<h.length;e++){const r=h[e];if(a&&a.indexOf(r)<0)continue;const i=o[r];if(!i)continue;let f={};y&&u&&(f=u.getState(i.sourceLayer||"_geojsonTileLayer",y));const m=p({},l[r]);m.paint=hc(m.paint,i.paint,d,f,s),m.layout=hc(m.layout,i.layout,d,f,s);const g=!c||c(d,i,f);if(!g)continue;const x=new uc(d,this.z,this.x,this.y,y);x.layer=m;let v=t[r];void 0===v&&(v=t[r]=[]),v.push({featureIndex:n,feature:x,intersectionZ:g});}}lookupSymbolFeatures(t,e,r,n,i,a,s,o){const l={};this.loadVTLayers();const u=$r(i);for(const i of t)this.loadMatchingFeature(l,r,n,i,u,a,s,o,e);return l}hasLayer(t){for(const e of this.bucketLayerIDs)for(const r of e)if(t===r)return !0;return !1}getId(t,e){let r=t.id;return this.promoteId&&(r=t.properties["string"==typeof this.promoteId?this.promoteId:this.promoteId[e]],"boolean"==typeof r&&(r=Number(r))),r}}function hc(t,e,r,n,i){return d(t,((t,a)=>{const s=e instanceof ui?e.get(a):null;return s&&s.evaluate?s.evaluate(r,n,i):s}))}function pc(t){let e=1/0,r=1/0,n=-1/0,i=-1/0;for(const a of t)e=Math.min(e,a.x),r=Math.min(r,a.y),n=Math.max(n,a.x),i=Math.max(i,a.y);return {minX:e,minY:r,maxX:n,maxY:i}}function fc(t,e){return e-t}function dc(t,e,r,n,a){const s=[];for(let o=0;o<t.length;o++){const l=t[o];let u;for(let t=0;t<l.length-1;t++){let o=l[t],c=l[t+1];o.x<e&&c.x<e||(o.x<e?o=new i(e,o.y+(e-o.x)/(c.x-o.x)*(c.y-o.y))._round():c.x<e&&(c=new i(e,o.y+(e-o.x)/(c.x-o.x)*(c.y-o.y))._round()),o.y<r&&c.y<r||(o.y<r?o=new i(o.x+(r-o.y)/(c.y-o.y)*(c.x-o.x),r)._round():c.y<r&&(c=new i(o.x+(r-o.y)/(c.y-o.y)*(c.x-o.x),r)._round()),o.x>=n&&c.x>=n||(o.x>=n?o=new i(n,o.y+(n-o.x)/(c.x-o.x)*(c.y-o.y))._round():c.x>=n&&(c=new i(n,o.y+(n-o.x)/(c.x-o.x)*(c.y-o.y))._round()),o.y>=a&&c.y>=a||(o.y>=a?o=new i(o.x+(a-o.y)/(c.y-o.y)*(c.x-o.x),a)._round():c.y>=a&&(c=new i(o.x+(a-o.y)/(c.y-o.y)*(c.x-o.x),a)._round()),u&&o.equals(u[u.length-1])||(u=[o],s.push(u)),u.push(c)))));}}return s}Pn("FeatureIndex",cc,{omit:["rawTileData","sourceLayerCoder"]});class yc extends i{constructor(t,e,r,n){super(t,e),this.angle=r,void 0!==n&&(this.segment=n);}clone(){return new yc(this.x,this.y,this.angle,this.segment)}}function mc(t,e,r,n,i){if(void 0===e.segment||0===r)return !0;let a=e,s=e.segment+1,o=0;for(;o>-r/2;){if(s--,s<0)return !1;o-=t[s].dist(a),a=t[s];}o+=t[s].dist(t[s+1]),s++;const l=[];let u=0;for(;o<r/2;){const e=t[s],r=t[s+1];if(!r)return !1;let a=t[s-1].angleTo(e)-e.angleTo(r);for(a=Math.abs((a+3*Math.PI)%(2*Math.PI)-Math.PI),l.push({distance:o,angleDelta:a}),u+=a;o-l[0].distance>n;)u-=l.shift().angleDelta;if(u>i)return !1;s++,o+=e.dist(r);}return !0}function gc(t){let e=0;for(let r=0;r<t.length-1;r++)e+=t[r].dist(t[r+1]);return e}function xc(t,e,r){return t?.6*e*r:0}function vc(t,e){return Math.max(t?t.right-t.left:0,e?e.right-e.left:0)}function bc(t,e,r,n,i,a){const s=xc(r,i,a),o=vc(r,n)*a;let l=0;const u=gc(t)/2;for(let r=0;r<t.length-1;r++){const n=t[r],i=t[r+1],a=n.dist(i);if(l+a>u){const c=(u-l)/a,h=De.number(n.x,i.x,c),p=De.number(n.y,i.y,c),f=new yc(h,p,i.angleTo(n),r);return f._round(),!s||mc(t,f,o,s,e)?f:void 0}l+=a;}}function wc(t,e,r,n,i,a,s,o,l){const u=xc(n,a,s),c=vc(n,i),h=c*s,p=0===t[0].x||t[0].x===l||0===t[0].y||t[0].y===l;return e-h<e/4&&(e=h+e/4),_c(t,p?e/2*o%e:(c/2+2*a)*s*o%e,e,u,r,h,p,!1,l)}function _c(t,e,r,n,i,a,s,o,l){const u=a/2,c=gc(t);let h=0,p=e-r,f=[];for(let e=0;e<t.length-1;e++){const s=t[e],o=t[e+1],d=s.dist(o),y=o.angleTo(s);for(;p+r<h+d;){p+=r;const m=(p-h)/d,g=De.number(s.x,o.x,m),x=De.number(s.y,o.y,m);if(g>=0&&g<l&&x>=0&&x<l&&p-u>=0&&p+u<=c){const r=new yc(g,x,y,e);r._round(),n&&!mc(t,r,a,n,i)||f.push(r);}}h+=d;}return o||f.length||s||(f=_c(t,h/2,r,n,i,a,s,!0,l)),f}Pn("Anchor",yc);const Ac=eu;function Sc(t,e,r,n){const a=[],s=t.image,o=s.pixelRatio,l=s.paddedRect.w-2*Ac,u=s.paddedRect.h-2*Ac,c=t.right-t.left,h=t.bottom-t.top,p=s.stretchX||[[0,l]],f=s.stretchY||[[0,u]],d=(t,e)=>t+e[1]-e[0],y=p.reduce(d,0),m=f.reduce(d,0),g=l-y,x=u-m;let v=0,b=y,w=0,_=m,A=0,S=g,k=0,I=x;if(s.content&&n){const t=s.content;v=kc(p,0,t[0]),w=kc(f,0,t[1]),b=kc(p,t[0],t[2]),_=kc(f,t[1],t[3]),A=t[0]-v,k=t[1]-w,S=t[2]-t[0]-b,I=t[3]-t[1]-_;}const z=(n,a,l,u)=>{const p=zc(n.stretch-v,b,c,t.left),f=Mc(n.fixed-A,S,n.stretch,y),d=zc(a.stretch-w,_,h,t.top),g=Mc(a.fixed-k,I,a.stretch,m),x=zc(l.stretch-v,b,c,t.left),z=Mc(l.fixed-A,S,l.stretch,y),M=zc(u.stretch-w,_,h,t.top),P=Mc(u.fixed-k,I,u.stretch,m),B=new i(p,d),C=new i(x,d),V=new i(x,M),E=new i(p,M),T=new i(f/o,g/o),F=new i(z/o,P/o),L=e*Math.PI/180;if(L){const t=Math.sin(L),e=Math.cos(L),r=[e,-t,t,e];B._matMult(r),C._matMult(r),E._matMult(r),V._matMult(r);}const $=n.stretch+n.fixed,D=a.stretch+a.fixed;return {tl:B,tr:C,bl:E,br:V,tex:{x:s.paddedRect.x+Ac+$,y:s.paddedRect.y+Ac+D,w:l.stretch+l.fixed-$,h:u.stretch+u.fixed-D},writingMode:void 0,glyphOffset:[0,0],sectionIndex:0,pixelOffsetTL:T,pixelOffsetBR:F,minFontScaleX:S/o/c,minFontScaleY:I/o/h,isSDF:r}};if(n&&(s.stretchX||s.stretchY)){const t=Ic(p,g,y),e=Ic(f,x,m);for(let r=0;r<t.length-1;r++){const n=t[r],i=t[r+1];for(let t=0;t<e.length-1;t++)a.push(z(n,e[t],i,e[t+1]));}}else a.push(z({fixed:0,stretch:-1},{fixed:0,stretch:-1},{fixed:0,stretch:l+1},{fixed:0,stretch:u+1}));return a}function kc(t,e,r){let n=0;for(const i of t)n+=Math.max(e,Math.min(r,i[1]))-Math.max(e,Math.min(r,i[0]));return n}function Ic(t,e,r){const n=[{fixed:-Ac,stretch:0}];for(const[e,r]of t){const t=n[n.length-1];n.push({fixed:e-t.stretch,stretch:t.stretch}),n.push({fixed:e-t.stretch,stretch:t.stretch+(r-e)});}return n.push({fixed:e+Ac,stretch:r}),n}function zc(t,e,r,n){return t/e*r+n}function Mc(t,e,r,n){return t-e*r/n}class Pc{constructor(t,e,r,n,a,s,o,l,u,c){if(this.boxStartIndex=t.length,u){let t=s.top,e=s.bottom;const r=s.collisionPadding;r&&(t-=r[1],e+=r[3]);let n=e-t;n>0&&(n=Math.max(10,n),this.circleDiameter=n);}else {let u=s.top*o-l[0],h=s.bottom*o+l[2],p=s.left*o-l[3],f=s.right*o+l[1];const d=s.collisionPadding;if(d&&(p-=d[0]*o,u-=d[1]*o,f+=d[2]*o,h+=d[3]*o),c){const t=new i(p,u),e=new i(f,u),r=new i(p,h),n=new i(f,h),a=c*Math.PI/180;t._rotate(a),e._rotate(a),r._rotate(a),n._rotate(a),p=Math.min(t.x,e.x,r.x,n.x),f=Math.max(t.x,e.x,r.x,n.x),u=Math.min(t.y,e.y,r.y,n.y),h=Math.max(t.y,e.y,r.y,n.y);}t.emplaceBack(e.x,e.y,p,u,f,h,r,n,a);}this.boxEndIndex=t.length;}}class Bc{constructor(t=[],e=Cc){if(this.data=t,this.length=this.data.length,this.compare=e,this.length>0)for(let t=(this.length>>1)-1;t>=0;t--)this._down(t);}push(t){this.data.push(t),this.length++,this._up(this.length-1);}pop(){if(0===this.length)return;const t=this.data[0],e=this.data.pop();return this.length--,this.length>0&&(this.data[0]=e,this._down(0)),t}peek(){return this.data[0]}_up(t){const{data:e,compare:r}=this,n=e[t];for(;t>0;){const i=t-1>>1,a=e[i];if(r(n,a)>=0)break;e[t]=a,t=i;}e[t]=n;}_down(t){const{data:e,compare:r}=this,n=this.length>>1,i=e[t];for(;t<n;){let n=1+(t<<1),a=e[n];const s=n+1;if(s<this.length&&r(e[s],a)<0&&(n=s,a=e[s]),r(a,i)>=0)break;e[t]=a,t=n;}e[t]=i;}}function Cc(t,e){return t<e?-1:t>e?1:0}function Vc(t,e=1,r=!1){let n=1/0,a=1/0,s=-1/0,o=-1/0;const l=t[0];for(let t=0;t<l.length;t++){const e=l[t];(!t||e.x<n)&&(n=e.x),(!t||e.y<a)&&(a=e.y),(!t||e.x>s)&&(s=e.x),(!t||e.y>o)&&(o=e.y);}const u=Math.min(s-n,o-a);let c=u/2;const h=new Bc([],Ec);if(0===u)return new i(n,a);for(let e=n;e<s;e+=u)for(let r=a;r<o;r+=u)h.push(new Tc(e+c,r+c,c,t));let p=function(t){let e=0,r=0,n=0;const i=t[0];for(let t=0,a=i.length,s=a-1;t<a;s=t++){const a=i[t],o=i[s],l=a.x*o.y-o.x*a.y;r+=(a.x+o.x)*l,n+=(a.y+o.y)*l,e+=3*l;}return new Tc(r/e,n/e,0,t)}(t),f=h.length;for(;h.length;){const n=h.pop();(n.d>p.d||!p.d)&&(p=n,r&&console.log("found best %d after %d probes",Math.round(1e4*n.d)/1e4,f)),n.max-p.d<=e||(c=n.h/2,h.push(new Tc(n.p.x-c,n.p.y-c,c,t)),h.push(new Tc(n.p.x+c,n.p.y-c,c,t)),h.push(new Tc(n.p.x-c,n.p.y+c,c,t)),h.push(new Tc(n.p.x+c,n.p.y+c,c,t)),f+=4);}return r&&(console.log(`num probes: ${f}`),console.log(`best distance: ${p.d}`)),p.p}function Ec(t,e){return e.max-t.max}function Tc(t,e,r,n){this.p=new i(t,e),this.h=r,this.d=function(t,e){let r=!1,n=1/0;for(let i=0;i<e.length;i++){const a=e[i];for(let e=0,i=a.length,s=i-1;e<i;s=e++){const i=a[e],o=a[s];i.y>t.y!=o.y>t.y&&t.x<(o.x-i.x)*(t.y-i.y)/(o.y-i.y)+i.x&&(r=!r),n=Math.min(n,us(t,i,o));}}return (r?1:-1)*Math.sqrt(n)}(this.p,n),this.max=this.d+this.h*Math.SQRT2;}var Fc;t.TextAnchorEnum=void 0,(Fc=t.TextAnchorEnum||(t.TextAnchorEnum={}))[Fc.center=1]="center",Fc[Fc.left=2]="left",Fc[Fc.right=3]="right",Fc[Fc.top=4]="top",Fc[Fc.bottom=5]="bottom",Fc[Fc["top-left"]=6]="top-left",Fc[Fc["top-right"]=7]="top-right",Fc[Fc["bottom-left"]=8]="bottom-left",Fc[Fc["bottom-right"]=9]="bottom-right";const Lc=7,$c=Number.POSITIVE_INFINITY;function Dc(t,e){return e[1]!==$c?function(t,e,r){let n=0,i=0;switch(e=Math.abs(e),r=Math.abs(r),t){case"top-right":case"top-left":case"top":i=r-Lc;break;case"bottom-right":case"bottom-left":case"bottom":i=-r+Lc;}switch(t){case"top-right":case"bottom-right":case"right":n=-e;break;case"top-left":case"bottom-left":case"left":n=e;}return [n,i]}(t,e[0],e[1]):function(t,e){let r=0,n=0;e<0&&(e=0);const i=e/Math.SQRT2;switch(t){case"top-right":case"top-left":n=i-Lc;break;case"bottom-right":case"bottom-left":n=-i+Lc;break;case"bottom":n=-e+Lc;break;case"top":n=e-Lc;}switch(t){case"top-right":case"bottom-right":r=-i;break;case"top-left":case"bottom-left":r=i;break;case"left":r=e;break;case"right":r=-e;}return [r,n]}(t,e[0])}function Oc(t,e,r){var n;const i=t.layout,a=null===(n=i.get("text-variable-anchor-offset"))||void 0===n?void 0:n.evaluate(e,{},r);if(a){const t=a.values,e=[];for(let r=0;r<t.length;r+=2){const n=e[r]=t[r],i=t[r+1].map((t=>t*kl));n.startsWith("top")?i[1]-=Lc:n.startsWith("bottom")&&(i[1]+=Lc),e[r+1]=i;}return new Xt(e)}const s=i.get("text-variable-anchor");if(s){let n;n=void 0!==t._unevaluatedLayout.getValue("text-radial-offset")?[i.get("text-radial-offset").evaluate(e,{},r)*kl,$c]:i.get("text-offset").evaluate(e,{},r).map((t=>t*kl));const a=[];for(const t of s)a.push(t,Dc(t,n));return new Xt(a)}return null}function Uc(t){switch(t){case"right":case"top-right":case"bottom-right":return "right";case"left":case"top-left":case"bottom-left":return "left"}return "center"}function Rc(e,r,n,i,a,s,o,l,u,c,h){let p=s.textMaxSize.evaluate(r,{});void 0===p&&(p=o);const f=e.layers[0].layout,d=f.get("icon-offset").evaluate(r,{},h),y=jc(n.horizontal),m=o/24,g=e.tilePixelRatio*m,v=e.tilePixelRatio*p/24,b=e.tilePixelRatio*l,w=e.tilePixelRatio*f.get("symbol-spacing"),_=f.get("text-padding")*e.tilePixelRatio,A=function(t,e,r,n=1){const i=t.get("icon-padding").evaluate(e,{},r),a=i&&i.values;return [a[0]*n,a[1]*n,a[2]*n,a[3]*n]}(f,r,h,e.tilePixelRatio),S=f.get("text-max-angle")/180*Math.PI,k="viewport"!==f.get("text-rotation-alignment")&&"point"!==f.get("symbol-placement"),I="map"===f.get("icon-rotation-alignment")&&"point"!==f.get("symbol-placement"),z=f.get("symbol-placement"),M=w/2,P=f.get("icon-text-fit");let B;i&&"none"!==P&&(e.allowVerticalPlacement&&n.vertical&&(B=bu(i,n.vertical,P,f.get("icon-text-fit-padding"),d,m)),y&&(i=bu(i,y,P,f.get("icon-text-fit-padding"),d,m)));const C=(l,p)=>{p.x<0||p.x>=Xa||p.y<0||p.y>=Xa||function(e,r,n,i,a,s,o,l,u,c,h,p,f,d,y,m,g,v,b,w,_,A,S,k,I){const z=e.addToLineVertexArray(r,n);let M,P,B,C,V=0,E=0,T=0,F=0,L=-1,$=-1;const D={};let O=Pa("");if(e.allowVerticalPlacement&&i.vertical){const t=l.layout.get("text-rotate").evaluate(_,{},k)+90;B=new Pc(u,r,c,h,p,i.vertical,f,d,y,t),o&&(C=new Pc(u,r,c,h,p,o,g,v,y,t));}if(a){const n=l.layout.get("icon-rotate").evaluate(_,{}),i="none"!==l.layout.get("icon-text-fit"),s=Sc(a,n,S,i),f=o?Sc(o,n,S,i):void 0;P=new Pc(u,r,c,h,p,a,g,v,!1,n),V=4*s.length;const d=e.iconSizeData;let y=null;"source"===d.kind?(y=[_u*l.layout.get("icon-size").evaluate(_,{})],y[0]>Au&&x(`${e.layerIds[0]}: Value for "icon-size" is >= ${wu}. Reduce your "icon-size".`)):"composite"===d.kind&&(y=[_u*A.compositeIconSizes[0].evaluate(_,{},k),_u*A.compositeIconSizes[1].evaluate(_,{},k)],(y[0]>Au||y[1]>Au)&&x(`${e.layerIds[0]}: Value for "icon-size" is >= ${wu}. Reduce your "icon-size".`)),e.addSymbols(e.icon,s,y,w,b,_,t.WritingMode.none,r,z.lineStartIndex,z.lineLength,-1,k),L=e.icon.placedSymbolArray.length-1,f&&(E=4*f.length,e.addSymbols(e.icon,f,y,w,b,_,t.WritingMode.vertical,r,z.lineStartIndex,z.lineLength,-1,k),$=e.icon.placedSymbolArray.length-1);}const U=Object.keys(i.horizontal);for(const n of U){const a=i.horizontal[n];if(!M){O=Pa(a.text);const t=l.layout.get("text-rotate").evaluate(_,{},k);M=new Pc(u,r,c,h,p,a,f,d,y,t);}const o=1===a.positionedLines.length;if(T+=qc(e,r,a,s,l,y,_,m,z,i.vertical?t.WritingMode.horizontal:t.WritingMode.horizontalOnly,o?U:[n],D,L,A,k),o)break}i.vertical&&(F+=qc(e,r,i.vertical,s,l,y,_,m,z,t.WritingMode.vertical,["vertical"],D,$,A,k));const R=M?M.boxStartIndex:e.collisionBoxArray.length,q=M?M.boxEndIndex:e.collisionBoxArray.length,j=B?B.boxStartIndex:e.collisionBoxArray.length,N=B?B.boxEndIndex:e.collisionBoxArray.length,Z=P?P.boxStartIndex:e.collisionBoxArray.length,K=P?P.boxEndIndex:e.collisionBoxArray.length,G=C?C.boxStartIndex:e.collisionBoxArray.length,J=C?C.boxEndIndex:e.collisionBoxArray.length;let X=-1;const Y=(t,e)=>t&&t.circleDiameter?Math.max(t.circleDiameter,e):e;X=Y(M,X),X=Y(B,X),X=Y(P,X),X=Y(C,X);const H=X>-1?1:0;H&&(X*=I/kl),e.glyphOffsetArray.length>=Eu.MAX_GLYPHS&&x("Too many glyphs being rendered in a tile. See https://github.com/mapbox/mapbox-gl-js/issues/2907"),void 0!==_.sortKey&&e.addToSortKeyRanges(e.symbolInstances.length,_.sortKey);const W=Oc(l,_,k),[Q,tt]=function(e,r){const n=e.length,i=null==r?void 0:r.values;if((null==i?void 0:i.length)>0)for(let r=0;r<i.length;r+=2){const n=i[r+1];e.emplaceBack(t.TextAnchorEnum[i[r]],n[0],n[1]);}return [n,e.length]}(e.textAnchorOffsets,W);e.symbolInstances.emplaceBack(r.x,r.y,D.right>=0?D.right:-1,D.center>=0?D.center:-1,D.left>=0?D.left:-1,D.vertical||-1,L,$,O,R,q,j,N,Z,K,G,J,c,T,F,V,E,H,0,f,X,Q,tt);}(e,p,l,n,i,a,B,e.layers[0],e.collisionBoxArray,r.index,r.sourceLayerIndex,e.index,g,[_,_,_,_],k,u,b,A,I,d,r,s,c,h,o);};if("line"===z)for(const t of dc(r.geometry,0,0,Xa,Xa)){const r=wc(t,w,S,n.vertical||y,i,24,v,e.overscaling,Xa);for(const n of r)y&&Nc(e,y.text,M,n)||C(t,n);}else if("line-center"===z){for(const t of r.geometry)if(t.length>1){const e=bc(t,S,n.vertical||y,i,24,v);e&&C(t,e);}}else if("Polygon"===r.type)for(const t of _o(r.geometry,0)){const e=Vc(t,16);C(t[0],new yc(e.x,e.y,0));}else if("LineString"===r.type)for(const t of r.geometry)C(t,new yc(t[0].x,t[0].y,0));else if("Point"===r.type)for(const t of r.geometry)for(const e of t)C([e],new yc(e.x,e.y,0));}function qc(t,e,r,n,a,s,o,l,u,c,h,p,f,d,y){const m=function(t,e,r,n,a,s,o,l){const u=n.layout.get("text-rotate").evaluate(s,{})*Math.PI/180,c=[];for(const t of e.positionedLines)for(const n of t.positionedGlyphs){if(!n.rect)continue;const s=n.rect||{};let h=Ql+1,p=!0,f=1,d=0;const y=(a||l)&&n.vertical,m=n.metrics.advance*n.scale/2;if(l&&e.verticalizable&&(d=t.lineOffset/2-(n.imageName?-(kl-n.metrics.width*n.scale)/2:(n.scale-1)*kl)),n.imageName){const t=o[n.imageName];p=t.sdf,f=t.pixelRatio,h=eu/f;}const g=a?[n.x+m,n.y]:[0,0];let x=a?[0,0]:[n.x+m+r[0],n.y+r[1]-d],v=[0,0];y&&(v=x,x=[0,0]);const b=(n.metrics.left-h)*n.scale-m+x[0],w=(-n.metrics.top-h)*n.scale+x[1],_=b+s.w*n.scale/f,A=w+s.h*n.scale/f,S=new i(b,w),k=new i(_,w),I=new i(b,A),z=new i(_,A);if(y){const t=new i(-m,m-au),e=-Math.PI/2,r=kl/2-m,a=new i(5-au-r,-(n.imageName?r:0)),s=new i(...v);S._rotateAround(e,t)._add(a)._add(s),k._rotateAround(e,t)._add(a)._add(s),I._rotateAround(e,t)._add(a)._add(s),z._rotateAround(e,t)._add(a)._add(s);}if(u){const t=Math.sin(u),e=Math.cos(u),r=[e,-t,t,e];S._matMult(r),k._matMult(r),I._matMult(r),z._matMult(r);}const M=new i(0,0),P=new i(0,0);c.push({tl:S,tr:k,bl:I,br:z,tex:s,writingMode:e.writingMode,glyphOffset:g,sectionIndex:n.sectionIndex,isSDF:p,pixelOffsetTL:M,pixelOffsetBR:P,minFontScaleX:0,minFontScaleY:0});}return c}(0,r,l,a,s,o,n,t.allowVerticalPlacement),g=t.textSizeData;let v=null;"source"===g.kind?(v=[_u*a.layout.get("text-size").evaluate(o,{})],v[0]>Au&&x(`${t.layerIds[0]}: Value for "text-size" is >= ${wu}. Reduce your "text-size".`)):"composite"===g.kind&&(v=[_u*d.compositeTextSizes[0].evaluate(o,{},y),_u*d.compositeTextSizes[1].evaluate(o,{},y)],(v[0]>Au||v[1]>Au)&&x(`${t.layerIds[0]}: Value for "text-size" is >= ${wu}. Reduce your "text-size".`)),t.addSymbols(t.text,m,v,l,s,o,c,e,u.lineStartIndex,u.lineLength,f,y);for(const e of h)p[e]=t.text.placedSymbolArray.length-1;return 4*m.length}function jc(t){for(const e in t)return t[e];return null}function Nc(t,e,r,n){const i=t.compareText;if(e in i){const t=i[e];for(let e=t.length-1;e>=0;e--)if(n.dist(t[e])<r)return !0}else i[e]=[];return i[e].push(n),!1}const Zc=[Int8Array,Uint8Array,Uint8ClampedArray,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array];class Kc{static from(t){if(!(t instanceof ArrayBuffer))throw new Error("Data must be an instance of ArrayBuffer.");const[e,r]=new Uint8Array(t,0,2);if(219!==e)throw new Error("Data does not appear to be in a KDBush format.");const n=r>>4;if(1!==n)throw new Error(`Got v${n} data when expected v1.`);const i=Zc[15&r];if(!i)throw new Error("Unrecognized array type.");const[a]=new Uint16Array(t,2,1),[s]=new Uint32Array(t,4,1);return new Kc(s,a,i,t)}constructor(t,e=64,r=Float64Array,n){if(isNaN(t)||t<0)throw new Error(`Unpexpected numItems value: ${t}.`);this.numItems=+t,this.nodeSize=Math.min(Math.max(+e,2),65535),this.ArrayType=r,this.IndexArrayType=t<65536?Uint16Array:Uint32Array;const i=Zc.indexOf(this.ArrayType),a=2*t*this.ArrayType.BYTES_PER_ELEMENT,s=t*this.IndexArrayType.BYTES_PER_ELEMENT,o=(8-s%8)%8;if(i<0)throw new Error(`Unexpected typed array class: ${r}.`);n&&n instanceof ArrayBuffer?(this.data=n,this.ids=new this.IndexArrayType(this.data,8,t),this.coords=new this.ArrayType(this.data,8+s+o,2*t),this._pos=2*t,this._finished=!0):(this.data=new ArrayBuffer(8+a+s+o),this.ids=new this.IndexArrayType(this.data,8,t),this.coords=new this.ArrayType(this.data,8+s+o,2*t),this._pos=0,this._finished=!1,new Uint8Array(this.data,0,2).set([219,16+i]),new Uint16Array(this.data,2,1)[0]=e,new Uint32Array(this.data,4,1)[0]=t);}add(t,e){const r=this._pos>>1;return this.ids[r]=r,this.coords[this._pos++]=t,this.coords[this._pos++]=e,r}finish(){const t=this._pos>>1;if(t!==this.numItems)throw new Error(`Added ${t} items when expected ${this.numItems}.`);return Gc(this.ids,this.coords,this.nodeSize,0,this.numItems-1,0),this._finished=!0,this}range(t,e,r,n){if(!this._finished)throw new Error("Data not yet indexed - call index.finish().");const{ids:i,coords:a,nodeSize:s}=this,o=[0,i.length-1,0],l=[];for(;o.length;){const u=o.pop()||0,c=o.pop()||0,h=o.pop()||0;if(c-h<=s){for(let s=h;s<=c;s++){const o=a[2*s],u=a[2*s+1];o>=t&&o<=r&&u>=e&&u<=n&&l.push(i[s]);}continue}const p=h+c>>1,f=a[2*p],d=a[2*p+1];f>=t&&f<=r&&d>=e&&d<=n&&l.push(i[p]),(0===u?t<=f:e<=d)&&(o.push(h),o.push(p-1),o.push(1-u)),(0===u?r>=f:n>=d)&&(o.push(p+1),o.push(c),o.push(1-u));}return l}within(t,e,r){if(!this._finished)throw new Error("Data not yet indexed - call index.finish().");const{ids:n,coords:i,nodeSize:a}=this,s=[0,n.length-1,0],o=[],l=r*r;for(;s.length;){const u=s.pop()||0,c=s.pop()||0,h=s.pop()||0;if(c-h<=a){for(let r=h;r<=c;r++)Hc(i[2*r],i[2*r+1],t,e)<=l&&o.push(n[r]);continue}const p=h+c>>1,f=i[2*p],d=i[2*p+1];Hc(f,d,t,e)<=l&&o.push(n[p]),(0===u?t-r<=f:e-r<=d)&&(s.push(h),s.push(p-1),s.push(1-u)),(0===u?t+r>=f:e+r>=d)&&(s.push(p+1),s.push(c),s.push(1-u));}return o}}function Gc(t,e,r,n,i,a){if(i-n<=r)return;const s=n+i>>1;Jc(t,e,s,n,i,a),Gc(t,e,r,n,s-1,1-a),Gc(t,e,r,s+1,i,1-a);}function Jc(t,e,r,n,i,a){for(;i>n;){if(i-n>600){const s=i-n+1,o=r-n+1,l=Math.log(s),u=.5*Math.exp(2*l/3),c=.5*Math.sqrt(l*u*(s-u)/s)*(o-s/2<0?-1:1);Jc(t,e,r,Math.max(n,Math.floor(r-o*u/s+c)),Math.min(i,Math.floor(r+(s-o)*u/s+c)),a);}const s=e[2*r+a];let o=n,l=i;for(Xc(t,e,n,r),e[2*i+a]>s&&Xc(t,e,n,i);o<l;){for(Xc(t,e,o,l),o++,l--;e[2*o+a]<s;)o++;for(;e[2*l+a]>s;)l--;}e[2*n+a]===s?Xc(t,e,n,l):(l++,Xc(t,e,l,i)),l<=r&&(n=l+1),r<=l&&(i=l-1);}}function Xc(t,e,r,n){Yc(t,r,n),Yc(e,2*r,2*n),Yc(e,2*r+1,2*n+1);}function Yc(t,e,r){const n=t[e];t[e]=t[r],t[r]=n;}function Hc(t,e,r,n){const i=t-r,a=e-n;return i*i+a*a}var Wc;t.PerformanceMarkers=void 0,(Wc=t.PerformanceMarkers||(t.PerformanceMarkers={})).create="create",Wc.load="load",Wc.fullLoad="fullLoad";let Qc=null,th=[];const eh=1e3/60,rh="loadTime",nh="fullLoadTime",ih={mark(t){performance.mark(t);},frame(t){const e=t;null!=Qc&&th.push(e-Qc),Qc=e;},clearMetrics(){Qc=null,th=[],performance.clearMeasures(rh),performance.clearMeasures(nh);for(const e in t.PerformanceMarkers)performance.clearMarks(t.PerformanceMarkers[e]);},getPerformanceMetrics(){performance.measure(rh,t.PerformanceMarkers.create,t.PerformanceMarkers.load),performance.measure(nh,t.PerformanceMarkers.create,t.PerformanceMarkers.fullLoad);const e=performance.getEntriesByName(rh)[0].duration,r=performance.getEntriesByName(nh)[0].duration,n=th.length,i=1/(th.reduce(((t,e)=>t+e),0)/n/1e3),a=th.filter((t=>t>eh)).reduce(((t,e)=>t+(e-eh)/eh),0);return {loadTime:e,fullLoadTime:r,fps:i,percentDroppedFrames:a/(n+a)*100,totalFrames:n}}};t.AJAXError=B,t.ARRAY_TYPE=bs,t.Actor=class{constructor(t,e,r){this.receive=t=>{const e=t.data,r=e.id;if(r&&(!e.targetMapId||this.mapId===e.targetMapId))if("<cancel>"===e.type){delete this.tasks[r];const t=this.cancelCallbacks[r];delete this.cancelCallbacks[r],t&&t();}else w()||e.mustQueue?(this.tasks[r]=e,this.taskQueue.push(r),this.invoker.trigger()):this.processTask(r,e);},this.process=()=>{if(!this.taskQueue.length)return;const t=this.taskQueue.shift(),e=this.tasks[t];delete this.tasks[t],this.taskQueue.length&&this.invoker.trigger(),e&&this.processTask(t,e);},this.target=t,this.parent=e,this.mapId=r,this.callbacks={},this.tasks={},this.taskQueue=[],this.cancelCallbacks={},this.invoker=new Ku(this.process),this.target.addEventListener("message",this.receive,!1),this.globalScope=w()?t:window;}send(t,e,r,n,i=!1){const a=Math.round(1e18*Math.random()).toString(36).substring(0,10);r&&(this.callbacks[a]=r);const s=A(this.globalScope)?void 0:[];return this.target.postMessage({id:a,type:t,hasCallback:!!r,targetMapId:n,mustQueue:i,sourceMapId:this.mapId,data:Cn(e,s)},s),{cancel:()=>{r&&delete this.callbacks[a],this.target.postMessage({id:a,type:"<cancel>",targetMapId:n,sourceMapId:this.mapId});}}}processTask(t,e){if("<response>"===e.type){const r=this.callbacks[t];delete this.callbacks[t],r&&(e.error?r(Vn(e.error)):r(null,Vn(e.data)));}else {let r=!1;const n=A(this.globalScope)?void 0:[],i=e.hasCallback?(e,i)=>{r=!0,delete this.cancelCallbacks[t],this.target.postMessage({id:t,type:"<response>",sourceMapId:this.mapId,error:e?Cn(e):null,data:Cn(i,n)},n);}:t=>{r=!0;};let a=null;const s=Vn(e.data);if(this.parent[e.type])a=this.parent[e.type](e.sourceMapId,s,i);else if(this.parent.getWorkerSource){const t=e.type.split(".");a=this.parent.getWorkerSource(e.sourceMapId,t[0],s.source)[t[1]](s,i);}else i(new Error(`Could not find function ${e.type}`));!r&&a&&a.cancel&&(this.cancelCallbacks[t]=a.cancel);}}remove(){this.invoker.remove(),this.target.removeEventListener("message",this.receive,!1);}},t.AlphaImage=Ts,t.CanonicalTileID=nc,t.CollisionBoxArray=Gi,t.CollisionCircleLayoutArray=class extends Fi{},t.Color=jt,t.DEMData=oc,t.DataConstantProperty=ci,t.DictionaryCoder=lc,t.EXTENT=Xa,t.ErrorEvent=U,t.EvaluationParameters=ei,t.Event=O,t.Evented=R,t.FeatureIndex=cc,t.FillBucket=Io,t.FillExtrusionBucket=Xo,t.GeoJSONFeature=uc,t.ImageAtlas=nu,t.ImagePosition=ru,t.KDBush=Kc,t.LineBucket=cl,t.LineStripIndexArray=class extends Ni{},t.LngLat=Ju,t.MercatorCoordinate=ec,t.ONE_EM=kl,t.OverscaledTileID=ac,t.PerformanceUtils=ih,t.Point=i,t.Pos3dArray=class extends Si{},t.PosArray=ia,t.Properties=yi,t.Protobuf=Jl,t.QuadTriangleArray=class extends $i{},t.RGBAImage=Fs,t.RasterBoundsArray=class extends ki{},t.RequestPerformance=class{constructor(t){this._marks={start:[t.url,"start"].join("#"),end:[t.url,"end"].join("#"),measure:t.url.toString()},performance.mark(this._marks.start);}finish(){performance.mark(this._marks.end);let t=performance.getEntriesByName(this._marks.measure);return 0===t.length&&(performance.measure(this._marks.measure,this._marks.start,this._marks.end),t=performance.getEntriesByName(this._marks.measure),performance.clearMarks(this._marks.start),performance.clearMarks(this._marks.end),performance.clearMeasures(this._marks.measure)),t}},t.SegmentVector=ba,t.SymbolBucket=Eu,t.Transitionable=ii,t.TriangleIndexArray=ma,t.Uniform1f=Fa,t.Uniform1i=class extends Ta{constructor(t,e){super(t,e),this.current=0;}set(t){this.current!==t&&(this.current=t,this.gl.uniform1i(this.location,t));}},t.Uniform2f=class extends Ta{constructor(t,e){super(t,e),this.current=[0,0];}set(t){t[0]===this.current[0]&&t[1]===this.current[1]||(this.current=t,this.gl.uniform2f(this.location,t[0],t[1]));}},t.Uniform3f=class extends Ta{constructor(t,e){super(t,e),this.current=[0,0,0];}set(t){t[0]===this.current[0]&&t[1]===this.current[1]&&t[2]===this.current[2]||(this.current=t,this.gl.uniform3f(this.location,t[0],t[1],t[2]));}},t.Uniform4f=La,t.UniformColor=$a,t.UniformMatrix4f=class extends Ta{constructor(t,e){super(t,e),this.current=Da;}set(t){if(t[12]!==this.current[12]||t[0]!==this.current[0])return this.current=t,void this.gl.uniformMatrix4fv(this.location,!1,t);for(let e=1;e<16;e++)if(t[e]!==this.current[e]){this.current=t,this.gl.uniformMatrix4fv(this.location,!1,t);break}}},t.UnwrappedTileID=ic,t.ValidationError=tt,t.ZoomHistory=En,t.addDynamicAttributes=Pu,t.arrayBufferToImage=function(t,e){const r=new Image;r.onload=()=>{e(null,r),URL.revokeObjectURL(r.src),r.onload=null,window.requestAnimationFrame((()=>{r.src=k;}));},r.onerror=()=>e(new Error("Could not load image. Please make sure to use a supported image type such as PNG or JPEG. Note that SVGs are not supported."));const n=new Blob([new Uint8Array(t)],{type:"image/png"});r.src=t.byteLength?URL.createObjectURL(n):k;},t.arrayBufferToImageBitmap=function(t,e){const r=new Blob([new Uint8Array(t)],{type:"image/png"});createImageBitmap(r).then((t=>{e(null,t);})).catch((t=>{e(new Error(`Could not load image because of ${t.message}. Please make sure to use a supported image type such as PNG or JPEG. Note that SVGs are not supported.`));}));},t.asyncAll=function(t,e,r){if(!t.length)return r(null,[]);let n=t.length;const i=new Array(t.length);let a=null;t.forEach(((t,s)=>{e(t,((t,e)=>{t&&(a=t),i[s]=e,0==--n&&r(a,i);}));}));},t.bezier=l,t.browser=M,t.clamp=c,t.clipLine=dc,t.clone=function(t){var e=new bs(16);return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e[4]=t[4],e[5]=t[5],e[6]=t[6],e[7]=t[7],e[8]=t[8],e[9]=t[9],e[10]=t[10],e[11]=t[11],e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15],e},t.clone$1=m,t.collisionCircleLayout=_l,t.config=P,t.copy=function(t,e){return t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t[4]=e[4],t[5]=e[5],t[6]=e[6],t[7]=e[7],t[8]=e[8],t[9]=e[9],t[10]=e[10],t[11]=e[11],t[12]=e[12],t[13]=e[13],t[14]=e[14],t[15]=e[15],t},t.create=function(){var t=new bs(16);return bs!=Float32Array&&(t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0),t[0]=1,t[5]=1,t[10]=1,t[15]=1,t},t.createExpression=Pr,t.createFilter=$r,t.createLayout=wi,t.createStyleLayer=function(t){if("custom"===t.type)return new Zu(t);switch(t.type){case"background":return new Ru(t);case"circle":return new Is(t);case"fill":return new Bo(t);case"fill-extrusion":return new tl(t);case"heatmap":return new $s(t);case"hillshade":return new Us(t);case"line":return new ml(t);case"raster":return new Nu(t);case"symbol":return new Du(t)}},t.deepEqual=function t(e,r){if(Array.isArray(e)){if(!Array.isArray(r)||e.length!==r.length)return !1;for(let n=0;n<e.length;n++)if(!t(e[n],r[n]))return !1;return !0}if("object"==typeof e&&null!==e&&null!==r){if("object"!=typeof r)return !1;if(Object.keys(e).length!==Object.keys(r).length)return !1;for(const n in e)if(!t(e[n],r[n]))return !1;return !0}return e===r},t.defaultEasing=u,t.derefLayers=function(t){t=t.slice();const e=Object.create(null);for(let r=0;r<t.length;r++)e[t[r].id]=t[r];for(let r=0;r<t.length;r++)"ref"in t[r]&&(t[r]=N(t[r],e[t[r].ref]));return t},t.diffStyles=function(t,e){if(!t)return [{command:K.setStyle,args:[e]}];let r=[];try{if(!Z(t.version,e.version))return [{command:K.setStyle,args:[e]}];Z(t.center,e.center)||r.push({command:K.setCenter,args:[e.center]}),Z(t.zoom,e.zoom)||r.push({command:K.setZoom,args:[e.zoom]}),Z(t.bearing,e.bearing)||r.push({command:K.setBearing,args:[e.bearing]}),Z(t.pitch,e.pitch)||r.push({command:K.setPitch,args:[e.pitch]}),Z(t.sprite,e.sprite)||r.push({command:K.setSprite,args:[e.sprite]}),Z(t.glyphs,e.glyphs)||r.push({command:K.setGlyphs,args:[e.glyphs]}),Z(t.transition,e.transition)||r.push({command:K.setTransition,args:[e.transition]}),Z(t.light,e.light)||r.push({command:K.setLight,args:[e.light]});const n={},i=[];!function(t,e,r,n){let i;for(i in e=e||{},t=t||{})Object.prototype.hasOwnProperty.call(t,i)&&(Object.prototype.hasOwnProperty.call(e,i)||J(i,r,n));for(i in e)Object.prototype.hasOwnProperty.call(e,i)&&(Object.prototype.hasOwnProperty.call(t,i)?Z(t[i],e[i])||("geojson"===t[i].type&&"geojson"===e[i].type&&Y(t,e,i)?r.push({command:K.setGeoJSONSourceData,args:[i,e[i].data]}):X(i,e,r,n)):G(i,e,r));}(t.sources,e.sources,i,n);const a=[];t.layers&&t.layers.forEach((t=>{n[t.source]?r.push({command:K.removeLayer,args:[t.id]}):a.push(t);})),r=r.concat(i),function(t,e,r){e=e||[];const n=(t=t||[]).map(W),i=e.map(W),a=t.reduce(Q,{}),s=e.reduce(Q,{}),o=n.slice(),l=Object.create(null);let u,c,h,p,f,d,y;for(u=0,c=0;u<n.length;u++)h=n[u],Object.prototype.hasOwnProperty.call(s,h)?c++:(r.push({command:K.removeLayer,args:[h]}),o.splice(o.indexOf(h,c),1));for(u=0,c=0;u<i.length;u++)h=i[i.length-1-u],o[o.length-1-u]!==h&&(Object.prototype.hasOwnProperty.call(a,h)?(r.push({command:K.removeLayer,args:[h]}),o.splice(o.lastIndexOf(h,o.length-c),1)):c++,d=o[o.length-u],r.push({command:K.addLayer,args:[s[h],d]}),o.splice(o.length-u,0,h),l[h]=!0);for(u=0;u<i.length;u++)if(h=i[u],p=a[h],f=s[h],!l[h]&&!Z(p,f))if(Z(p.source,f.source)&&Z(p["source-layer"],f["source-layer"])&&Z(p.type,f.type)){for(y in H(p.layout,f.layout,r,h,null,K.setLayoutProperty),H(p.paint,f.paint,r,h,null,K.setPaintProperty),Z(p.filter,f.filter)||r.push({command:K.setFilter,args:[h,f.filter]}),Z(p.minzoom,f.minzoom)&&Z(p.maxzoom,f.maxzoom)||r.push({command:K.setLayerZoomRange,args:[h,f.minzoom,f.maxzoom]}),p)Object.prototype.hasOwnProperty.call(p,y)&&"layout"!==y&&"paint"!==y&&"filter"!==y&&"metadata"!==y&&"minzoom"!==y&&"maxzoom"!==y&&(0===y.indexOf("paint.")?H(p[y],f[y],r,h,y.slice(6),K.setPaintProperty):Z(p[y],f[y])||r.push({command:K.setLayerProperty,args:[h,y,f[y]]}));for(y in f)Object.prototype.hasOwnProperty.call(f,y)&&!Object.prototype.hasOwnProperty.call(p,y)&&"layout"!==y&&"paint"!==y&&"filter"!==y&&"metadata"!==y&&"minzoom"!==y&&"maxzoom"!==y&&(0===y.indexOf("paint.")?H(p[y],f[y],r,h,y.slice(6),K.setPaintProperty):Z(p[y],f[y])||r.push({command:K.setLayerProperty,args:[h,y,f[y]]}));}else r.push({command:K.removeLayer,args:[h]}),d=o[o.lastIndexOf(h)+1],r.push({command:K.addLayer,args:[f,d]});}(a,e.layers,r);}catch(t){console.warn("Unable to compute style diff:",t),r=[{command:K.setStyle,args:[e]}];}return r},t.dot=function(t,e){return t[0]*e[0]+t[1]*e[1]+t[2]*e[2]+t[3]*e[3]},t.earthRadius=Gu,t.emitValidationErrors=In,t.emptyStyle=function(){const t={},e=q.$version;for(const r in q.$root){const n=q.$root[r];if(n.required){let i=null;i="version"===r?e:"array"===n.type?[]:{},null!=i&&(t[r]=i);}}return t},t.equals=function(t,e){var r=t[0],n=t[1],i=t[2],a=t[3],s=t[4],o=t[5],l=t[6],u=t[7],c=t[8],h=t[9],p=t[10],f=t[11],d=t[12],y=t[13],m=t[14],g=t[15],x=e[0],v=e[1],b=e[2],w=e[3],_=e[4],A=e[5],S=e[6],k=e[7],I=e[8],z=e[9],M=e[10],P=e[11],B=e[12],C=e[13],V=e[14],E=e[15];return Math.abs(r-x)<=vs*Math.max(1,Math.abs(r),Math.abs(x))&&Math.abs(n-v)<=vs*Math.max(1,Math.abs(n),Math.abs(v))&&Math.abs(i-b)<=vs*Math.max(1,Math.abs(i),Math.abs(b))&&Math.abs(a-w)<=vs*Math.max(1,Math.abs(a),Math.abs(w))&&Math.abs(s-_)<=vs*Math.max(1,Math.abs(s),Math.abs(_))&&Math.abs(o-A)<=vs*Math.max(1,Math.abs(o),Math.abs(A))&&Math.abs(l-S)<=vs*Math.max(1,Math.abs(l),Math.abs(S))&&Math.abs(u-k)<=vs*Math.max(1,Math.abs(u),Math.abs(k))&&Math.abs(c-I)<=vs*Math.max(1,Math.abs(c),Math.abs(I))&&Math.abs(h-z)<=vs*Math.max(1,Math.abs(h),Math.abs(z))&&Math.abs(p-M)<=vs*Math.max(1,Math.abs(p),Math.abs(M))&&Math.abs(f-P)<=vs*Math.max(1,Math.abs(f),Math.abs(P))&&Math.abs(d-B)<=vs*Math.max(1,Math.abs(d),Math.abs(B))&&Math.abs(y-C)<=vs*Math.max(1,Math.abs(y),Math.abs(C))&&Math.abs(m-V)<=vs*Math.max(1,Math.abs(m),Math.abs(V))&&Math.abs(g-E)<=vs*Math.max(1,Math.abs(g),Math.abs(E))},t.evaluateSizeForFeature=function(t,{uSize:e,uSizeT:r},{lowerSize:n,upperSize:i}){return "source"===t.kind?n/_u:"composite"===t.kind?De.number(n/_u,i/_u,r):e},t.evaluateSizeForZoom=function(t,e){let r=0,n=0;if("constant"===t.kind)n=t.layoutSize;else if("source"!==t.kind){const{interpolationType:i,minZoom:a,maxZoom:s}=t,o=i?c(Oe.interpolationFactor(i,e,a,s),0,1):0;"camera"===t.kind?n=De.number(t.minSize,t.maxSize,o):r=o;}return {uSizeT:r,uSize:n}},t.evented=Hn,t.extend=p,t.filterObject=y,t.findLineIntersection=function(t,e,r,n){const a=e.y-t.y,s=e.x-t.x,o=n.y-r.y,l=n.x-r.x,u=o*s-l*a;if(0===u)return null;const c=(l*(t.y-r.y)-o*(t.x-r.x))/u;return new i(t.x+c*s,t.y+c*a)},t.fromScaling=function(t,e){return t[0]=e[0],t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=e[1],t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[10]=e[2],t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,t},t.getAnchorAlignment=gu,t.getAnchorJustification=Uc,t.getArrayBuffer=F,t.getDefaultExportFromCjs=e,t.getJSON=function(t,e){return T(p(t,{type:"json"}),e)},t.getOverlapMode=ku,t.getProtocolAction=V,t.getRTLTextPluginStatus=Wn,t.getReferrer=C,t.getVideo=function(t,e){const r=window.document.createElement("video");r.muted=!0,r.onloadstart=function(){e(null,r);};for(let e=0;e<t.length;e++){const n=window.document.createElement("source");L(t[e])||(r.crossOrigin="Anonymous"),n.src=t[e],r.appendChild(n);}return {cancel:()=>{}}},t.groupByLayout=function(t,e){const r={};for(let n=0;n<t.length;n++){const i=e&&e[t[n].id]||Kr(t[n]);e&&(e[t[n].id]=i);let a=r[i];a||(a=r[i]=[]),a.push(t[n]);}const n=[];for(const t in r)n.push(r[t]);return n},t.identity=ws,t.interpolate=De,t.invert=function(t,e){var r=e[0],n=e[1],i=e[2],a=e[3],s=e[4],o=e[5],l=e[6],u=e[7],c=e[8],h=e[9],p=e[10],f=e[11],d=e[12],y=e[13],m=e[14],g=e[15],x=r*o-n*s,v=r*l-i*s,b=r*u-a*s,w=n*l-i*o,_=n*u-a*o,A=i*u-a*l,S=c*y-h*d,k=c*m-p*d,I=c*g-f*d,z=h*m-p*y,M=h*g-f*y,P=p*g-f*m,B=x*P-v*M+b*z+w*I-_*k+A*S;return B?(t[0]=(o*P-l*M+u*z)*(B=1/B),t[1]=(i*M-n*P-a*z)*B,t[2]=(y*A-m*_+g*w)*B,t[3]=(p*_-h*A-f*w)*B,t[4]=(l*I-s*P-u*k)*B,t[5]=(r*P-i*I+a*k)*B,t[6]=(m*b-d*A-g*v)*B,t[7]=(c*A-p*b+f*v)*B,t[8]=(s*M-o*I+u*S)*B,t[9]=(n*I-r*M-a*S)*B,t[10]=(d*_-y*b+g*x)*B,t[11]=(h*b-c*_-f*x)*B,t[12]=(o*k-s*z-l*S)*B,t[13]=(r*z-n*k+i*S)*B,t[14]=(y*v-d*w-m*x)*B,t[15]=(c*w-h*v+p*x)*B,t):null},t.isImageBitmap=S,t.isSafari=A,t.isWorker=w,t.keysDifference=function(t,e){const r=[];for(const n in t)n in e||r.push(n);return r},t.lazyLoadRTLTextPlugin=function(){ti.isLoading()||ti.isLoaded()||"deferred"!==Wn()||Qn();},t.makeRequest=T,t.mapObject=d,t.mercatorXfromLng=Hu,t.mercatorYfromLat=Wu,t.mercatorZfromAltitude=Qu,t.mul=Ss,t.mul$1=function(t,e,r){return t[0]=e[0]*r[0],t[1]=e[1]*r[1],t[2]=e[2]*r[2],t[3]=e[3]*r[3],t},t.multiply=_s,t.nextPowerOfTwo=function(t){return t<=1?1:Math.pow(2,Math.ceil(Math.log(t)/Math.LN2))},t.operations=K,t.ortho=function(t,e,r,n,i,a,s){var o=1/(e-r),l=1/(n-i),u=1/(a-s);return t[0]=-2*o,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=-2*l,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[10]=2*u,t[11]=0,t[12]=(e+r)*o,t[13]=(i+n)*l,t[14]=(s+a)*u,t[15]=1,t},t.parseCacheControl=function(t){const e={};if(t.replace(/(?:^|(?:\s*\,\s*))([^\x00-\x20\(\)<>@\,;\:\\"\/\[\]\?\=\{\}\x7F]+)(?:\=(?:([^\x00-\x20\(\)<>@\,;\:\\"\/\[\]\?\=\{\}\x7F]+)|(?:\"((?:[^"\\]|\\.)*)\")))?/g,((t,r,n,i)=>{const a=n||i;return e[r]=!a||a.toLowerCase(),""})),e["max-age"]){const t=parseInt(e["max-age"],10);isNaN(t)?delete e["max-age"]:e["max-age"]=t;}return e},t.parseGlyphPbf=function(t){return new Jl(t).readFields(Yl,[])},t.pbf=Il,t.performSymbolLayout=function(e){e.bucket.createArrays(),e.bucket.tilePixelRatio=Xa/(512*e.bucket.overscaling),e.bucket.compareText={},e.bucket.iconsNeedLinear=!1;const r=e.bucket.layers[0],n=r.layout,i=r._unevaluatedLayout._values,a={layoutIconSize:i["icon-size"].possiblyEvaluate(new ei(e.bucket.zoom+1),e.canonical),layoutTextSize:i["text-size"].possiblyEvaluate(new ei(e.bucket.zoom+1),e.canonical),textMaxSize:i["text-size"].possiblyEvaluate(new ei(18))};if("composite"===e.bucket.textSizeData.kind){const{minZoom:t,maxZoom:r}=e.bucket.textSizeData;a.compositeTextSizes=[i["text-size"].possiblyEvaluate(new ei(t),e.canonical),i["text-size"].possiblyEvaluate(new ei(r),e.canonical)];}if("composite"===e.bucket.iconSizeData.kind){const{minZoom:t,maxZoom:r}=e.bucket.iconSizeData;a.compositeIconSizes=[i["icon-size"].possiblyEvaluate(new ei(t),e.canonical),i["icon-size"].possiblyEvaluate(new ei(r),e.canonical)];}const s=n.get("text-line-height")*kl,o="viewport"!==n.get("text-rotation-alignment")&&"point"!==n.get("symbol-placement"),l=n.get("text-keep-upright"),u=n.get("text-size");for(const i of e.bucket.features){const c=n.get("text-font").evaluate(i,{},e.canonical).join(","),h=u.evaluate(i,{},e.canonical),p=a.layoutTextSize.evaluate(i,{},e.canonical),f=a.layoutIconSize.evaluate(i,{},e.canonical),d={horizontal:{},vertical:void 0},y=i.text;let m,g=[0,0];if(y){const a=y.toString(),u=n.get("text-letter-spacing").evaluate(i,{},e.canonical)*kl,f=Ln(a)?u:0,m=n.get("text-anchor").evaluate(i,{},e.canonical),x=Oc(r,i,e.canonical);if(!x){const t=n.get("text-radial-offset").evaluate(i,{},e.canonical);g=t?Dc(m,[t*kl,$c]):n.get("text-offset").evaluate(i,{},e.canonical).map((t=>t*kl));}let v=o?"center":n.get("text-justify").evaluate(i,{},e.canonical);const b=n.get("symbol-placement"),w="point"===b?n.get("text-max-width").evaluate(i,{},e.canonical)*kl:0,_=()=>{e.bucket.allowVerticalPlacement&&Fn(a)&&(d.vertical=lu(y,e.glyphMap,e.glyphPositions,e.imagePositions,c,w,s,m,"left",f,g,t.WritingMode.vertical,!0,b,p,h));};if(!o&&x){const r=new Set;if("auto"===v)for(let t=0;t<x.values.length;t+=2)r.add(Uc(x.values[t]));else r.add(v);let n=!1;for(const i of r)if(!d.horizontal[i])if(n)d.horizontal[i]=d.horizontal[0];else {const r=lu(y,e.glyphMap,e.glyphPositions,e.imagePositions,c,w,s,"center",i,f,g,t.WritingMode.horizontal,!1,b,p,h);r&&(d.horizontal[i]=r,n=1===r.positionedLines.length);}_();}else {"auto"===v&&(v=Uc(m));const r=lu(y,e.glyphMap,e.glyphPositions,e.imagePositions,c,w,s,m,v,f,g,t.WritingMode.horizontal,!1,b,p,h);r&&(d.horizontal[v]=r),_(),Fn(a)&&o&&l&&(d.vertical=lu(y,e.glyphMap,e.glyphPositions,e.imagePositions,c,w,s,m,v,f,g,t.WritingMode.vertical,!1,b,p,h));}}let v=!1;if(i.icon&&i.icon.name){const t=e.imageMap[i.icon.name];t&&(m=vu(e.imagePositions[i.icon.name],n.get("icon-offset").evaluate(i,{},e.canonical),n.get("icon-anchor").evaluate(i,{},e.canonical)),v=!!t.sdf,void 0===e.bucket.sdfIcons?e.bucket.sdfIcons=v:e.bucket.sdfIcons!==v&&x("Style sheet warning: Cannot mix SDF and non-SDF icons in one buffer"),(t.pixelRatio!==e.bucket.pixelRatio||0!==n.get("icon-rotate").constantOr(1))&&(e.bucket.iconsNeedLinear=!0));}const b=jc(d.horizontal)||d.vertical;e.bucket.iconsInText=!!b&&b.iconsInText,(b||m)&&Rc(e.bucket,i,d,m,e.imageMap,a,p,f,g,v,e.canonical);}e.showCollisionBoxes&&e.bucket.generateCollisionDebugBuffers();},t.perspective=function(t,e,r,n,i){var a,s=1/Math.tan(e/2);return t[0]=s/r,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=s,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[11]=-1,t[12]=0,t[13]=0,t[15]=0,null!=i&&i!==1/0?(t[10]=(i+n)*(a=1/(n-i)),t[14]=2*i*n*a):(t[10]=-1,t[14]=-2*n),t},t.pick=function(t,e){const r={};for(let n=0;n<e.length;n++){const i=e[n];i in t&&(r[i]=t[i]);}return r},t.plugin=ti,t.pointGeometry=r,t.polygonIntersectsPolygon=rs,t.potpack=tu,t.register=Pn,t.registerForPluginStateChange=function(t){return t({pluginStatus:Gn,pluginURL:Jn}),Hn.on("pluginStateChange",t),t},t.renderColorRamp=Ls,t.rotateX=function(t,e,r){var n=Math.sin(r),i=Math.cos(r),a=e[4],s=e[5],o=e[6],l=e[7],u=e[8],c=e[9],h=e[10],p=e[11];return e!==t&&(t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t[12]=e[12],t[13]=e[13],t[14]=e[14],t[15]=e[15]),t[4]=a*i+u*n,t[5]=s*i+c*n,t[6]=o*i+h*n,t[7]=l*i+p*n,t[8]=u*i-a*n,t[9]=c*i-s*n,t[10]=h*i-o*n,t[11]=p*i-l*n,t},t.rotateZ=function(t,e,r){var n=Math.sin(r),i=Math.cos(r),a=e[0],s=e[1],o=e[2],l=e[3],u=e[4],c=e[5],h=e[6],p=e[7];return e!==t&&(t[8]=e[8],t[9]=e[9],t[10]=e[10],t[11]=e[11],t[12]=e[12],t[13]=e[13],t[14]=e[14],t[15]=e[15]),t[0]=a*i+u*n,t[1]=s*i+c*n,t[2]=o*i+h*n,t[3]=l*i+p*n,t[4]=u*i-a*n,t[5]=c*i-s*n,t[6]=h*i-o*n,t[7]=p*i-l*n,t},t.sameOrigin=L,t.scale=function(t,e,r){var n=r[0],i=r[1],a=r[2];return t[0]=e[0]*n,t[1]=e[1]*n,t[2]=e[2]*n,t[3]=e[3]*n,t[4]=e[4]*i,t[5]=e[5]*i,t[6]=e[6]*i,t[7]=e[7]*i,t[8]=e[8]*a,t[9]=e[9]*a,t[10]=e[10]*a,t[11]=e[11]*a,t[12]=e[12],t[13]=e[13],t[14]=e[14],t[15]=e[15],t},t.setRTLTextPlugin=function(t,e,r=!1){if(Gn===jn||Gn===Nn||Gn===Zn)throw new Error("setRTLTextPlugin cannot be called multiple times.");Jn=M.resolveURL(t),Gn=jn,Kn=e,Yn(),r||Qn();},t.sphericalToCartesian=function([t,e,r]){return e+=90,e*=Math.PI/180,r*=Math.PI/180,{x:t*Math.cos(e)*Math.sin(r),y:t*Math.sin(e)*Math.sin(r),z:t*Math.cos(r)}},t.toEvaluationFeature=Qa,t.transformMat4=ks,t.translate=function(t,e,r){var n,i,a,s,o,l,u,c,h,p,f,d,y=r[0],m=r[1],g=r[2];return e===t?(t[12]=e[0]*y+e[4]*m+e[8]*g+e[12],t[13]=e[1]*y+e[5]*m+e[9]*g+e[13],t[14]=e[2]*y+e[6]*m+e[10]*g+e[14],t[15]=e[3]*y+e[7]*m+e[11]*g+e[15]):(i=e[1],a=e[2],s=e[3],o=e[4],l=e[5],u=e[6],c=e[7],h=e[8],p=e[9],f=e[10],d=e[11],t[0]=n=e[0],t[1]=i,t[2]=a,t[3]=s,t[4]=o,t[5]=l,t[6]=u,t[7]=c,t[8]=h,t[9]=p,t[10]=f,t[11]=d,t[12]=n*y+o*m+h*g+e[12],t[13]=i*y+l*m+p*g+e[13],t[14]=a*y+u*m+f*g+e[14],t[15]=s*y+c*m+d*g+e[15]),t},t.triggerPluginCompletionEvent=Xn,t.unicodeBlockLookup=Tn,t.uniqueId=function(){return f++},t.v8Spec=q,t.validateCustomStyleLayer=function(t){const e=[],r=t.id;return void 0===r&&e.push({message:`layers.${r}: missing required property "id"`}),void 0===t.render&&e.push({message:`layers.${r}: missing required method "render"`}),t.renderingMode&&"2d"!==t.renderingMode&&"3d"!==t.renderingMode&&e.push({message:`layers.${r}: property "renderingMode" must be either "2d" or "3d"`}),e},t.validateLight=An,t.validateStyle=_n,t.vectorTile=To,t.warnOnce=x,t.wrap=h;}));

    define(["./shared"],(function(e){class t{constructor(e){this.keyCache={},e&&this.replace(e);}replace(e){this._layerConfigs={},this._layers={},this.update(e,[]);}update(t,i){for(const i of t){this._layerConfigs[i.id]=i;const t=this._layers[i.id]=e.createStyleLayer(i);t._featureFilter=e.createFilter(t.filter),this.keyCache[i.id]&&delete this.keyCache[i.id];}for(const e of i)delete this.keyCache[e],delete this._layerConfigs[e],delete this._layers[e];this.familiesBySource={};const o=e.groupByLayout(Object.values(this._layerConfigs),this.keyCache);for(const e of o){const t=e.map((e=>this._layers[e.id])),i=t[0];if("none"===i.visibility)continue;const o=i.source||"";let r=this.familiesBySource[o];r||(r=this.familiesBySource[o]={});const s=i.sourceLayer||"_geojsonTileLayer";let n=r[s];n||(n=r[s]=[]),n.push(t);}}}class i{constructor(t){const i={},o=[];for(const e in t){const r=t[e],s=i[e]={};for(const e in r){const t=r[+e];if(!t||0===t.bitmap.width||0===t.bitmap.height)continue;const i={x:0,y:0,w:t.bitmap.width+2,h:t.bitmap.height+2};o.push(i),s[e]={rect:i,metrics:t.metrics};}}const{w:r,h:s}=e.potpack(o),n=new e.AlphaImage({width:r||1,height:s||1});for(const o in t){const r=t[o];for(const t in r){const s=r[+t];if(!s||0===s.bitmap.width||0===s.bitmap.height)continue;const a=i[o][t].rect;e.AlphaImage.copy(s.bitmap,n,{x:0,y:0},{x:a.x+1,y:a.y+1},s.bitmap);}}this.image=n,this.positions=i;}}e.register("GlyphAtlas",i);class o{constructor(t){this.tileID=new e.OverscaledTileID(t.tileID.overscaledZ,t.tileID.wrap,t.tileID.canonical.z,t.tileID.canonical.x,t.tileID.canonical.y),this.uid=t.uid,this.zoom=t.zoom,this.pixelRatio=t.pixelRatio,this.tileSize=t.tileSize,this.source=t.source,this.overscaling=this.tileID.overscaleFactor(),this.showCollisionBoxes=t.showCollisionBoxes,this.collectResourceTiming=!!t.collectResourceTiming,this.returnDependencies=!!t.returnDependencies,this.promoteId=t.promoteId,this.inFlightDependencies=[],this.dependencySentinel=-1;}parse(t,o,s,n,a){this.status="parsing",this.data=t,this.collisionBoxArray=new e.CollisionBoxArray;const l=new e.DictionaryCoder(Object.keys(t.layers).sort()),c=new e.FeatureIndex(this.tileID,this.promoteId);c.bucketLayerIDs=[];const h={},u={featureIndex:c,iconDependencies:{},patternDependencies:{},glyphDependencies:{},availableImages:s},d=o.familiesBySource[this.source];for(const i in d){const o=t.layers[i];if(!o)continue;1===o.version&&e.warnOnce(`Vector tile source "${this.source}" layer "${i}" does not use vector tile spec v2 and therefore may have some rendering errors.`);const n=l.encode(i),a=[];for(let e=0;e<o.length;e++){const t=o.feature(e),r=c.getId(t,i);a.push({feature:t,id:r,index:e,sourceLayerIndex:n});}for(const t of d[i]){const i=t[0];i.source!==this.source&&e.warnOnce(`layer.source = ${i.source} does not equal this.source = ${this.source}`),i.minzoom&&this.zoom<Math.floor(i.minzoom)||i.maxzoom&&this.zoom>=i.maxzoom||"none"!==i.visibility&&(r(t,this.zoom,s),(h[i.id]=i.createBucket({index:c.bucketLayerIDs.length,layers:t,zoom:this.zoom,pixelRatio:this.pixelRatio,overscaling:this.overscaling,collisionBoxArray:this.collisionBoxArray,sourceLayerIndex:n,sourceID:this.source})).populate(a,u,this.tileID.canonical),c.bucketLayerIDs.push(t.map((e=>e.id))));}}let p,f,g,m;const y=e.mapObject(u.glyphDependencies,(e=>Object.keys(e).map(Number)));this.inFlightDependencies.forEach((e=>null==e?void 0:e.cancel())),this.inFlightDependencies=[];const v=++this.dependencySentinel;Object.keys(y).length?this.inFlightDependencies.push(n.send("getGlyphs",{uid:this.uid,stacks:y,source:this.source,tileID:this.tileID,type:"glyphs"},((e,t)=>{v===this.dependencySentinel&&(p||(p=e,f=t,S.call(this)));}))):f={};const x=Object.keys(u.iconDependencies);x.length?this.inFlightDependencies.push(n.send("getImages",{icons:x,source:this.source,tileID:this.tileID,type:"icons"},((e,t)=>{v===this.dependencySentinel&&(p||(p=e,g=t,S.call(this)));}))):g={};const w=Object.keys(u.patternDependencies);function S(){if(p)return a(p);if(f&&g&&m){const t=new i(f),o=new e.ImageAtlas(g,m);for(const i in h){const n=h[i];n instanceof e.SymbolBucket?(r(n.layers,this.zoom,s),e.performSymbolLayout({bucket:n,glyphMap:f,glyphPositions:t.positions,imageMap:g,imagePositions:o.iconPositions,showCollisionBoxes:this.showCollisionBoxes,canonical:this.tileID.canonical})):n.hasPattern&&(n instanceof e.LineBucket||n instanceof e.FillBucket||n instanceof e.FillExtrusionBucket)&&(r(n.layers,this.zoom,s),n.addFeatures(u,this.tileID.canonical,o.patternPositions));}this.status="done",a(null,{buckets:Object.values(h).filter((e=>!e.isEmpty())),featureIndex:c,collisionBoxArray:this.collisionBoxArray,glyphAtlasImage:t.image,imageAtlas:o,glyphMap:this.returnDependencies?f:null,iconMap:this.returnDependencies?g:null,glyphPositions:this.returnDependencies?t.positions:null});}}w.length?this.inFlightDependencies.push(n.send("getImages",{icons:w,source:this.source,tileID:this.tileID,type:"patterns"},((e,t)=>{v===this.dependencySentinel&&(p||(p=e,m=t,S.call(this)));}))):m={},S.call(this);}}function r(t,i,o){const r=new e.EvaluationParameters(i);for(const e of t)e.recalculate(r,o);}function s(t,i){const o=e.getArrayBuffer(t.request,((t,o,r,s)=>{t?i(t):o&&i(null,{vectorTile:new e.vectorTile.VectorTile(new e.Protobuf(o)),rawData:o,cacheControl:r,expires:s});}));return ()=>{o.cancel(),i();}}class n{constructor(e,t,i,o){this.actor=e,this.layerIndex=t,this.availableImages=i,this.loadVectorData=o||s,this.fetching={},this.loading={},this.loaded={};}loadTile(t,i){const r=t.uid;this.loading||(this.loading={});const s=!!(t&&t.request&&t.request.collectResourceTiming)&&new e.RequestPerformance(t.request),n=this.loading[r]=new o(t);n.abort=this.loadVectorData(t,((t,o)=>{if(delete this.loading[r],t||!o)return n.status="done",this.loaded[r]=n,i(t);const a=o.rawData,l={};o.expires&&(l.expires=o.expires),o.cacheControl&&(l.cacheControl=o.cacheControl);const c={};if(s){const e=s.finish();e&&(c.resourceTiming=JSON.parse(JSON.stringify(e)));}n.vectorTile=o.vectorTile,n.parse(o.vectorTile,this.layerIndex,this.availableImages,this.actor,((t,o)=>{if(delete this.fetching[r],t||!o)return i(t);i(null,e.extend({rawTileData:a.slice(0)},o,l,c));})),this.loaded=this.loaded||{},this.loaded[r]=n,this.fetching[r]={rawTileData:a,cacheControl:l,resourceTiming:c};}));}reloadTile(t,i){const o=this.loaded,r=t.uid;if(o&&o[r]){const s=o[r];s.showCollisionBoxes=t.showCollisionBoxes,"parsing"===s.status?s.parse(s.vectorTile,this.layerIndex,this.availableImages,this.actor,((t,o)=>{if(t||!o)return i(t,o);let s;if(this.fetching[r]){const{rawTileData:t,cacheControl:i,resourceTiming:n}=this.fetching[r];delete this.fetching[r],s=e.extend({rawTileData:t.slice(0)},o,i,n);}else s=o;i(null,s);})):"done"===s.status&&(s.vectorTile?s.parse(s.vectorTile,this.layerIndex,this.availableImages,this.actor,i):i());}}abortTile(e,t){const i=this.loading,o=e.uid;i&&i[o]&&i[o].abort&&(i[o].abort(),delete i[o]),t();}removeTile(e,t){const i=this.loaded,o=e.uid;i&&i[o]&&delete i[o],t();}}class a{constructor(){this.loaded={};}loadTile(t,i){const{uid:o,encoding:r,rawImageData:s}=t,n=e.isImageBitmap(s)?this.getImageData(s):s,a=new e.DEMData(o,n,r);this.loaded=this.loaded||{},this.loaded[o]=a,i(null,a);}getImageData(t){this.offscreenCanvas&&this.offscreenCanvasContext||(this.offscreenCanvas=new OffscreenCanvas(t.width,t.height),this.offscreenCanvasContext=this.offscreenCanvas.getContext("2d",{willReadFrequently:!0})),this.offscreenCanvas.width=t.width,this.offscreenCanvas.height=t.height,this.offscreenCanvasContext.drawImage(t,0,0,t.width,t.height);const i=this.offscreenCanvasContext.getImageData(-1,-1,t.width+2,t.height+2);return this.offscreenCanvasContext.clearRect(0,0,this.offscreenCanvas.width,this.offscreenCanvas.height),new e.RGBAImage({width:i.width,height:i.height},i.data)}removeTile(e){const t=this.loaded,i=e.uid;t&&t[i]&&delete t[i];}}function l(e,t){if(0!==e.length){c(e[0],t);for(var i=1;i<e.length;i++)c(e[i],!t);}}function c(e,t){for(var i=0,o=0,r=0,s=e.length,n=s-1;r<s;n=r++){var a=(e[r][0]-e[n][0])*(e[n][1]+e[r][1]),l=i+a;o+=Math.abs(i)>=Math.abs(a)?i-l+a:a-l+i,i=l;}i+o>=0!=!!t&&e.reverse();}var h=e.getDefaultExportFromCjs((function e(t,i){var o,r=t&&t.type;if("FeatureCollection"===r)for(o=0;o<t.features.length;o++)e(t.features[o],i);else if("GeometryCollection"===r)for(o=0;o<t.geometries.length;o++)e(t.geometries[o],i);else if("Feature"===r)e(t.geometry,i);else if("Polygon"===r)l(t.coordinates,i);else if("MultiPolygon"===r)for(o=0;o<t.coordinates.length;o++)l(t.coordinates[o],i);return t}));const u=e.vectorTile.VectorTileFeature.prototype.toGeoJSON;var d={exports:{}},p=e.pointGeometry,f=e.vectorTile.VectorTileFeature,g=m;function m(e,t){this.options=t||{},this.features=e,this.length=e.length;}function y(e,t){this.id="number"==typeof e.id?e.id:void 0,this.type=e.type,this.rawGeometry=1===e.type?[e.geometry]:e.geometry,this.properties=e.tags,this.extent=t||4096;}m.prototype.feature=function(e){return new y(this.features[e],this.options.extent)},y.prototype.loadGeometry=function(){var e=this.rawGeometry;this.geometry=[];for(var t=0;t<e.length;t++){for(var i=e[t],o=[],r=0;r<i.length;r++)o.push(new p(i[r][0],i[r][1]));this.geometry.push(o);}return this.geometry},y.prototype.bbox=function(){this.geometry||this.loadGeometry();for(var e=this.geometry,t=1/0,i=-1/0,o=1/0,r=-1/0,s=0;s<e.length;s++)for(var n=e[s],a=0;a<n.length;a++){var l=n[a];t=Math.min(t,l.x),i=Math.max(i,l.x),o=Math.min(o,l.y),r=Math.max(r,l.y);}return [t,o,i,r]},y.prototype.toGeoJSON=f.prototype.toGeoJSON;var v=e.pbf,x=g;function w(e){var t=new v;return function(e,t){for(var i in e.layers)t.writeMessage(3,S,e.layers[i]);}(e,t),t.finish()}function S(e,t){var i;t.writeVarintField(15,e.version||1),t.writeStringField(1,e.name||""),t.writeVarintField(5,e.extent||4096);var o={keys:[],values:[],keycache:{},valuecache:{}};for(i=0;i<e.length;i++)o.feature=e.feature(i),t.writeMessage(2,b,o);var r=o.keys;for(i=0;i<r.length;i++)t.writeStringField(3,r[i]);var s=o.values;for(i=0;i<s.length;i++)t.writeMessage(4,k,s[i]);}function b(e,t){var i=e.feature;void 0!==i.id&&t.writeVarintField(1,i.id),t.writeMessage(2,I,e),t.writeVarintField(3,i.type),t.writeMessage(4,T,i);}function I(e,t){var i=e.feature,o=e.keys,r=e.values,s=e.keycache,n=e.valuecache;for(var a in i.properties){var l=i.properties[a],c=s[a];if(null!==l){void 0===c&&(o.push(a),s[a]=c=o.length-1),t.writeVarint(c);var h=typeof l;"string"!==h&&"boolean"!==h&&"number"!==h&&(l=JSON.stringify(l));var u=h+":"+l,d=n[u];void 0===d&&(r.push(l),n[u]=d=r.length-1),t.writeVarint(d);}}}function M(e,t){return (t<<3)+(7&e)}function P(e){return e<<1^e>>31}function T(e,t){for(var i=e.loadGeometry(),o=e.type,r=0,s=0,n=i.length,a=0;a<n;a++){var l=i[a],c=1;1===o&&(c=l.length),t.writeVarint(M(1,c));for(var h=3===o?l.length-1:l.length,u=0;u<h;u++){1===u&&1!==o&&t.writeVarint(M(2,h-1));var d=l[u].x-r,p=l[u].y-s;t.writeVarint(P(d)),t.writeVarint(P(p)),r+=d,s+=p;}3===o&&t.writeVarint(M(7,1));}}function k(e,t){var i=typeof e;"string"===i?t.writeStringField(1,e):"boolean"===i?t.writeBooleanField(7,e):"number"===i&&(e%1!=0?t.writeDoubleField(3,e):e<0?t.writeSVarintField(6,e):t.writeVarintField(5,e));}d.exports=w,d.exports.fromVectorTileJs=w,d.exports.fromGeojsonVt=function(e,t){t=t||{};var i={};for(var o in e)i[o]=new x(e[o].features,t),i[o].name=o,i[o].version=t.version,i[o].extent=t.extent;return w({layers:i})},d.exports.GeoJSONWrapper=x;var _=e.getDefaultExportFromCjs(d.exports);const C={minZoom:0,maxZoom:16,minPoints:2,radius:40,extent:512,nodeSize:64,log:!1,generateId:!1,reduce:null,map:e=>e},D=Math.fround||(O=new Float32Array(1),e=>(O[0]=+e,O[0]));var O;const L=3,F=5,E=6;class z{constructor(e){this.options=Object.assign(Object.create(C),e),this.trees=new Array(this.options.maxZoom+1),this.stride=this.options.reduce?7:6,this.clusterProps=[];}load(e){const{log:t,minZoom:i,maxZoom:o}=this.options;t&&console.time("total time");const r=`prepare ${e.length} points`;t&&console.time(r),this.points=e;const s=[];for(let t=0;t<e.length;t++){const i=e[t];if(!i.geometry)continue;const[o,r]=i.geometry.coordinates,n=D(B(o)),a=D(Z(r));s.push(n,a,1/0,t,-1,1),this.options.reduce&&s.push(0);}let n=this.trees[o+1]=this._createTree(s);t&&console.timeEnd(r);for(let e=o;e>=i;e--){const i=+Date.now();n=this.trees[e]=this._createTree(this._cluster(n,e)),t&&console.log("z%d: %d clusters in %dms",e,n.numItems,+Date.now()-i);}return t&&console.timeEnd("total time"),this}getClusters(e,t){let i=((e[0]+180)%360+360)%360-180;const o=Math.max(-90,Math.min(90,e[1]));let r=180===e[2]?180:((e[2]+180)%360+360)%360-180;const s=Math.max(-90,Math.min(90,e[3]));if(e[2]-e[0]>=360)i=-180,r=180;else if(i>r){const e=this.getClusters([i,o,180,s],t),n=this.getClusters([-180,o,r,s],t);return e.concat(n)}const n=this.trees[this._limitZoom(t)],a=n.range(B(i),Z(s),B(r),Z(o)),l=n.data,c=[];for(const e of a){const t=this.stride*e;c.push(l[t+F]>1?j(l,t,this.clusterProps):this.points[l[t+L]]);}return c}getChildren(e){const t=this._getOriginId(e),i=this._getOriginZoom(e),o="No cluster with the specified id.",r=this.trees[i];if(!r)throw new Error(o);const s=r.data;if(t*this.stride>=s.length)throw new Error(o);const n=this.options.radius/(this.options.extent*Math.pow(2,i-1)),a=r.within(s[t*this.stride],s[t*this.stride+1],n),l=[];for(const t of a){const i=t*this.stride;s[i+4]===e&&l.push(s[i+F]>1?j(s,i,this.clusterProps):this.points[s[i+L]]);}if(0===l.length)throw new Error(o);return l}getLeaves(e,t,i){const o=[];return this._appendLeaves(o,e,t=t||10,i=i||0,0),o}getTile(e,t,i){const o=this.trees[this._limitZoom(e)],r=Math.pow(2,e),{extent:s,radius:n}=this.options,a=n/s,l=(i-a)/r,c=(i+1+a)/r,h={features:[]};return this._addTileFeatures(o.range((t-a)/r,l,(t+1+a)/r,c),o.data,t,i,r,h),0===t&&this._addTileFeatures(o.range(1-a/r,l,1,c),o.data,r,i,r,h),t===r-1&&this._addTileFeatures(o.range(0,l,a/r,c),o.data,-1,i,r,h),h.features.length?h:null}getClusterExpansionZoom(e){let t=this._getOriginZoom(e)-1;for(;t<=this.options.maxZoom;){const i=this.getChildren(e);if(t++,1!==i.length)break;e=i[0].properties.cluster_id;}return t}_appendLeaves(e,t,i,o,r){const s=this.getChildren(t);for(const t of s){const s=t.properties;if(s&&s.cluster?r+s.point_count<=o?r+=s.point_count:r=this._appendLeaves(e,s.cluster_id,i,o,r):r<o?r++:e.push(t),e.length===i)break}return r}_createTree(t){const i=new e.KDBush(t.length/this.stride|0,this.options.nodeSize,Float32Array);for(let e=0;e<t.length;e+=this.stride)i.add(t[e],t[e+1]);return i.finish(),i.data=t,i}_addTileFeatures(e,t,i,o,r,s){for(const n of e){const e=n*this.stride,a=t[e+F]>1;let l,c,h;if(a)l=N(t,e,this.clusterProps),c=t[e],h=t[e+1];else {const i=this.points[t[e+L]];l=i.properties;const[o,r]=i.geometry.coordinates;c=B(o),h=Z(r);}const u={type:1,geometry:[[Math.round(this.options.extent*(c*r-i)),Math.round(this.options.extent*(h*r-o))]],tags:l};let d;d=a||this.options.generateId?t[e+L]:this.points[t[e+L]].id,void 0!==d&&(u.id=d),s.features.push(u);}}_limitZoom(e){return Math.max(this.options.minZoom,Math.min(Math.floor(+e),this.options.maxZoom+1))}_cluster(e,t){const{radius:i,extent:o,reduce:r,minPoints:s}=this.options,n=i/(o*Math.pow(2,t)),a=e.data,l=[],c=this.stride;for(let i=0;i<a.length;i+=c){if(a[i+2]<=t)continue;a[i+2]=t;const o=a[i],h=a[i+1],u=e.within(a[i],a[i+1],n),d=a[i+F];let p=d;for(const e of u){const i=e*c;a[i+2]>t&&(p+=a[i+F]);}if(p>d&&p>=s){let e,s=o*d,n=h*d,f=-1;const g=((i/c|0)<<5)+(t+1)+this.points.length;for(const o of u){const l=o*c;if(a[l+2]<=t)continue;a[l+2]=t;const h=a[l+F];s+=a[l]*h,n+=a[l+1]*h,a[l+4]=g,r&&(e||(e=this._map(a,i,!0),f=this.clusterProps.length,this.clusterProps.push(e)),r(e,this._map(a,l)));}a[i+4]=g,l.push(s/p,n/p,1/0,g,-1,p),r&&l.push(f);}else {for(let e=0;e<c;e++)l.push(a[i+e]);if(p>1)for(const e of u){const i=e*c;if(!(a[i+2]<=t)){a[i+2]=t;for(let e=0;e<c;e++)l.push(a[i+e]);}}}}return l}_getOriginId(e){return e-this.points.length>>5}_getOriginZoom(e){return (e-this.points.length)%32}_map(e,t,i){if(e[t+F]>1){const o=this.clusterProps[e[t+E]];return i?Object.assign({},o):o}const o=this.points[e[t+L]].properties,r=this.options.map(o);return i&&r===o?Object.assign({},r):r}}function j(e,t,i){return {type:"Feature",id:e[t+L],properties:N(e,t,i),geometry:{type:"Point",coordinates:[(o=e[t],360*(o-.5)),A(e[t+1])]}};var o;}function N(e,t,i){const o=e[t+F],r=o>=1e4?`${Math.round(o/1e3)}k`:o>=1e3?Math.round(o/100)/10+"k":o,s=e[t+E],n=-1===s?{}:Object.assign({},i[s]);return Object.assign(n,{cluster:!0,cluster_id:e[t+L],point_count:o,point_count_abbreviated:r})}function B(e){return e/360+.5}function Z(e){const t=Math.sin(e*Math.PI/180),i=.5-.25*Math.log((1+t)/(1-t))/Math.PI;return i<0?0:i>1?1:i}function A(e){const t=(180-360*e)*Math.PI/180;return 360*Math.atan(Math.exp(t))/Math.PI-90}function G(e,t,i,o){for(var r,s=o,n=i-t>>1,a=i-t,l=e[t],c=e[t+1],h=e[i],u=e[i+1],d=t+3;d<i;d+=3){var p=J(e[d],e[d+1],l,c,h,u);if(p>s)r=d,s=p;else if(p===s){var f=Math.abs(d-n);f<a&&(r=d,a=f);}}s>o&&(r-t>3&&G(e,t,r,o),e[r+2]=s,i-r>3&&G(e,r,i,o));}function J(e,t,i,o,r,s){var n=r-i,a=s-o;if(0!==n||0!==a){var l=((e-i)*n+(t-o)*a)/(n*n+a*a);l>1?(i=r,o=s):l>0&&(i+=n*l,o+=a*l);}return (n=e-i)*n+(a=t-o)*a}function Y(e,t,i,o){var r={id:void 0===e?null:e,type:t,geometry:i,tags:o,minX:1/0,minY:1/0,maxX:-1/0,maxY:-1/0};return function(e){var t=e.geometry,i=e.type;if("Point"===i||"MultiPoint"===i||"LineString"===i)R(e,t);else if("Polygon"===i||"MultiLineString"===i)for(var o=0;o<t.length;o++)R(e,t[o]);else if("MultiPolygon"===i)for(o=0;o<t.length;o++)for(var r=0;r<t[o].length;r++)R(e,t[o][r]);}(r),r}function R(e,t){for(var i=0;i<t.length;i+=3)e.minX=Math.min(e.minX,t[i]),e.minY=Math.min(e.minY,t[i+1]),e.maxX=Math.max(e.maxX,t[i]),e.maxY=Math.max(e.maxY,t[i+1]);}function V(e,t,i,o){if(t.geometry){var r=t.geometry.coordinates,s=t.geometry.type,n=Math.pow(i.tolerance/((1<<i.maxZoom)*i.extent),2),a=[],l=t.id;if(i.promoteId?l=t.properties[i.promoteId]:i.generateId&&(l=o||0),"Point"===s)X(r,a);else if("MultiPoint"===s)for(var c=0;c<r.length;c++)X(r[c],a);else if("LineString"===s)W(r,a,n,!1);else if("MultiLineString"===s){if(i.lineMetrics){for(c=0;c<r.length;c++)W(r[c],a=[],n,!1),e.push(Y(l,"LineString",a,t.properties));return}q(r,a,n,!1);}else if("Polygon"===s)q(r,a,n,!0);else {if("MultiPolygon"!==s){if("GeometryCollection"===s){for(c=0;c<t.geometry.geometries.length;c++)V(e,{id:l,geometry:t.geometry.geometries[c],properties:t.properties},i,o);return}throw new Error("Input data is not a valid GeoJSON object.")}for(c=0;c<r.length;c++){var h=[];q(r[c],h,n,!0),a.push(h);}}e.push(Y(l,s,a,t.properties));}}function X(e,t){t.push($(e[0])),t.push(U(e[1])),t.push(0);}function W(e,t,i,o){for(var r,s,n=0,a=0;a<e.length;a++){var l=$(e[a][0]),c=U(e[a][1]);t.push(l),t.push(c),t.push(0),a>0&&(n+=o?(r*c-l*s)/2:Math.sqrt(Math.pow(l-r,2)+Math.pow(c-s,2))),r=l,s=c;}var h=t.length-3;t[2]=1,G(t,0,h,i),t[h+2]=1,t.size=Math.abs(n),t.start=0,t.end=t.size;}function q(e,t,i,o){for(var r=0;r<e.length;r++){var s=[];W(e[r],s,i,o),t.push(s);}}function $(e){return e/360+.5}function U(e){var t=Math.sin(e*Math.PI/180),i=.5-.25*Math.log((1+t)/(1-t))/Math.PI;return i<0?0:i>1?1:i}function K(e,t,i,o,r,s,n,a){if(o/=t,s>=(i/=t)&&n<o)return e;if(n<i||s>=o)return null;for(var l=[],c=0;c<e.length;c++){var h=e[c],u=h.geometry,d=h.type,p=0===r?h.minX:h.minY,f=0===r?h.maxX:h.maxY;if(p>=i&&f<o)l.push(h);else if(!(f<i||p>=o)){var g=[];if("Point"===d||"MultiPoint"===d)H(u,g,i,o,r);else if("LineString"===d)Q(u,g,i,o,r,!1,a.lineMetrics);else if("MultiLineString"===d)te(u,g,i,o,r,!1);else if("Polygon"===d)te(u,g,i,o,r,!0);else if("MultiPolygon"===d)for(var m=0;m<u.length;m++){var y=[];te(u[m],y,i,o,r,!0),y.length&&g.push(y);}if(g.length){if(a.lineMetrics&&"LineString"===d){for(m=0;m<g.length;m++)l.push(Y(h.id,d,g[m],h.tags));continue}"LineString"!==d&&"MultiLineString"!==d||(1===g.length?(d="LineString",g=g[0]):d="MultiLineString"),"Point"!==d&&"MultiPoint"!==d||(d=3===g.length?"Point":"MultiPoint"),l.push(Y(h.id,d,g,h.tags));}}}return l.length?l:null}function H(e,t,i,o,r){for(var s=0;s<e.length;s+=3){var n=e[s+r];n>=i&&n<=o&&(t.push(e[s]),t.push(e[s+1]),t.push(e[s+2]));}}function Q(e,t,i,o,r,s,n){for(var a,l,c=ee(e),h=0===r?oe:re,u=e.start,d=0;d<e.length-3;d+=3){var p=e[d],f=e[d+1],g=e[d+2],m=e[d+3],y=e[d+4],v=0===r?p:f,x=0===r?m:y,w=!1;n&&(a=Math.sqrt(Math.pow(p-m,2)+Math.pow(f-y,2))),v<i?x>i&&(l=h(c,p,f,m,y,i),n&&(c.start=u+a*l)):v>o?x<o&&(l=h(c,p,f,m,y,o),n&&(c.start=u+a*l)):ie(c,p,f,g),x<i&&v>=i&&(l=h(c,p,f,m,y,i),w=!0),x>o&&v<=o&&(l=h(c,p,f,m,y,o),w=!0),!s&&w&&(n&&(c.end=u+a*l),t.push(c),c=ee(e)),n&&(u+=a);}var S=e.length-3;p=e[S],f=e[S+1],g=e[S+2],(v=0===r?p:f)>=i&&v<=o&&ie(c,p,f,g),S=c.length-3,s&&S>=3&&(c[S]!==c[0]||c[S+1]!==c[1])&&ie(c,c[0],c[1],c[2]),c.length&&t.push(c);}function ee(e){var t=[];return t.size=e.size,t.start=e.start,t.end=e.end,t}function te(e,t,i,o,r,s){for(var n=0;n<e.length;n++)Q(e[n],t,i,o,r,s,!1);}function ie(e,t,i,o){e.push(t),e.push(i),e.push(o);}function oe(e,t,i,o,r,s){var n=(s-t)/(o-t);return e.push(s),e.push(i+(r-i)*n),e.push(1),n}function re(e,t,i,o,r,s){var n=(s-i)/(r-i);return e.push(t+(o-t)*n),e.push(s),e.push(1),n}function se(e,t){for(var i=[],o=0;o<e.length;o++){var r,s=e[o],n=s.type;if("Point"===n||"MultiPoint"===n||"LineString"===n)r=ne(s.geometry,t);else if("MultiLineString"===n||"Polygon"===n){r=[];for(var a=0;a<s.geometry.length;a++)r.push(ne(s.geometry[a],t));}else if("MultiPolygon"===n)for(r=[],a=0;a<s.geometry.length;a++){for(var l=[],c=0;c<s.geometry[a].length;c++)l.push(ne(s.geometry[a][c],t));r.push(l);}i.push(Y(s.id,n,r,s.tags));}return i}function ne(e,t){var i=[];i.size=e.size,void 0!==e.start&&(i.start=e.start,i.end=e.end);for(var o=0;o<e.length;o+=3)i.push(e[o]+t,e[o+1],e[o+2]);return i}function ae(e,t){if(e.transformed)return e;var i,o,r,s=1<<e.z,n=e.x,a=e.y;for(i=0;i<e.features.length;i++){var l=e.features[i],c=l.geometry,h=l.type;if(l.geometry=[],1===h)for(o=0;o<c.length;o+=2)l.geometry.push(le(c[o],c[o+1],t,s,n,a));else for(o=0;o<c.length;o++){var u=[];for(r=0;r<c[o].length;r+=2)u.push(le(c[o][r],c[o][r+1],t,s,n,a));l.geometry.push(u);}}return e.transformed=!0,e}function le(e,t,i,o,r,s){return [Math.round(i*(e*o-r)),Math.round(i*(t*o-s))]}function ce(e,t,i,o,r){for(var s=t===r.maxZoom?0:r.tolerance/((1<<t)*r.extent),n={features:[],numPoints:0,numSimplified:0,numFeatures:0,source:null,x:i,y:o,z:t,transformed:!1,minX:2,minY:1,maxX:-1,maxY:0},a=0;a<e.length;a++){n.numFeatures++,he(n,e[a],s,r);var l=e[a].minX,c=e[a].minY,h=e[a].maxX,u=e[a].maxY;l<n.minX&&(n.minX=l),c<n.minY&&(n.minY=c),h>n.maxX&&(n.maxX=h),u>n.maxY&&(n.maxY=u);}return n}function he(e,t,i,o){var r=t.geometry,s=t.type,n=[];if("Point"===s||"MultiPoint"===s)for(var a=0;a<r.length;a+=3)n.push(r[a]),n.push(r[a+1]),e.numPoints++,e.numSimplified++;else if("LineString"===s)ue(n,r,e,i,!1,!1);else if("MultiLineString"===s||"Polygon"===s)for(a=0;a<r.length;a++)ue(n,r[a],e,i,"Polygon"===s,0===a);else if("MultiPolygon"===s)for(var l=0;l<r.length;l++){var c=r[l];for(a=0;a<c.length;a++)ue(n,c[a],e,i,!0,0===a);}if(n.length){var h=t.tags||null;if("LineString"===s&&o.lineMetrics){for(var u in h={},t.tags)h[u]=t.tags[u];h.mapbox_clip_start=r.start/r.size,h.mapbox_clip_end=r.end/r.size;}var d={geometry:n,type:"Polygon"===s||"MultiPolygon"===s?3:"LineString"===s||"MultiLineString"===s?2:1,tags:h};null!==t.id&&(d.id=t.id),e.features.push(d);}}function ue(e,t,i,o,r,s){var n=o*o;if(o>0&&t.size<(r?n:o))i.numPoints+=t.length/3;else {for(var a=[],l=0;l<t.length;l+=3)(0===o||t[l+2]>n)&&(i.numSimplified++,a.push(t[l]),a.push(t[l+1])),i.numPoints++;r&&function(e,t){for(var i=0,o=0,r=e.length,s=r-2;o<r;s=o,o+=2)i+=(e[o]-e[s])*(e[o+1]+e[s+1]);if(i>0===t)for(o=0,r=e.length;o<r/2;o+=2){var n=e[o],a=e[o+1];e[o]=e[r-2-o],e[o+1]=e[r-1-o],e[r-2-o]=n,e[r-1-o]=a;}}(a,s),e.push(a);}}function de(e,t){var i=(t=this.options=function(e,t){for(var i in t)e[i]=t[i];return e}(Object.create(this.options),t)).debug;if(i&&console.time("preprocess data"),t.maxZoom<0||t.maxZoom>24)throw new Error("maxZoom should be in the 0-24 range");if(t.promoteId&&t.generateId)throw new Error("promoteId and generateId cannot be used together.");var o=function(e,t){var i=[];if("FeatureCollection"===e.type)for(var o=0;o<e.features.length;o++)V(i,e.features[o],t,o);else V(i,"Feature"===e.type?e:{geometry:e},t);return i}(e,t);this.tiles={},this.tileCoords=[],i&&(console.timeEnd("preprocess data"),console.log("index: maxZoom: %d, maxPoints: %d",t.indexMaxZoom,t.indexMaxPoints),console.time("generate tiles"),this.stats={},this.total=0),o=function(e,t){var i=t.buffer/t.extent,o=e,r=K(e,1,-1-i,i,0,-1,2,t),s=K(e,1,1-i,2+i,0,-1,2,t);return (r||s)&&(o=K(e,1,-i,1+i,0,-1,2,t)||[],r&&(o=se(r,1).concat(o)),s&&(o=o.concat(se(s,-1)))),o}(o,t),o.length&&this.splitTile(o,0,0,0),i&&(o.length&&console.log("features: %d, points: %d",this.tiles[0].numFeatures,this.tiles[0].numPoints),console.timeEnd("generate tiles"),console.log("tiles generated:",this.total,JSON.stringify(this.stats)));}function pe(e,t,i){return 32*((1<<e)*i+t)+e}function fe(e,t){return t?e.properties[t]:e.id}function ge(e,t){if(null==e)return !0;if("Feature"===e.type)return null!=fe(e,t);if("FeatureCollection"===e.type){const i=new Set;for(const o of e.features){const e=fe(o,t);if(null==e)return !1;if(i.has(e))return !1;i.add(e);}return !0}return !1}function me(e,t){const i=new Map;if(null==e);else if("Feature"===e.type)i.set(fe(e,t),e);else for(const o of e.features)i.set(fe(o,t),o);return i}function ye(t,i){const o=t.tileID.canonical;if(!this._geoJSONIndex)return i(null,null);const r=this._geoJSONIndex.getTile(o.z,o.x,o.y);if(!r)return i(null,null);const s=new class{constructor(t){this.layers={_geojsonTileLayer:this},this.name="_geojsonTileLayer",this.extent=e.EXTENT,this.length=t.length,this._features=t;}feature(t){return new class{constructor(t){this._feature=t,this.extent=e.EXTENT,this.type=t.type,this.properties=t.tags,"id"in t&&!isNaN(t.id)&&(this.id=parseInt(t.id,10));}loadGeometry(){if(1===this._feature.type){const t=[];for(const i of this._feature.geometry)t.push([new e.Point(i[0],i[1])]);return t}{const t=[];for(const i of this._feature.geometry){const o=[];for(const t of i)o.push(new e.Point(t[0],t[1]));t.push(o);}return t}}toGeoJSON(e,t,i){return u.call(this,e,t,i)}}(this._features[t])}}(r.features);let n=_(s);0===n.byteOffset&&n.byteLength===n.buffer.byteLength||(n=new Uint8Array(n)),i(null,{vectorTile:s,rawData:n.buffer});}de.prototype.options={maxZoom:14,indexMaxZoom:5,indexMaxPoints:1e5,tolerance:3,extent:4096,buffer:64,lineMetrics:!1,promoteId:null,generateId:!1,debug:0},de.prototype.splitTile=function(e,t,i,o,r,s,n){for(var a=[e,t,i,o],l=this.options,c=l.debug;a.length;){o=a.pop(),i=a.pop(),t=a.pop(),e=a.pop();var h=1<<t,u=pe(t,i,o),d=this.tiles[u];if(!d&&(c>1&&console.time("creation"),d=this.tiles[u]=ce(e,t,i,o,l),this.tileCoords.push({z:t,x:i,y:o}),c)){c>1&&(console.log("tile z%d-%d-%d (features: %d, points: %d, simplified: %d)",t,i,o,d.numFeatures,d.numPoints,d.numSimplified),console.timeEnd("creation"));var p="z"+t;this.stats[p]=(this.stats[p]||0)+1,this.total++;}if(d.source=e,r){if(t===l.maxZoom||t===r)continue;var f=1<<r-t;if(i!==Math.floor(s/f)||o!==Math.floor(n/f))continue}else if(t===l.indexMaxZoom||d.numPoints<=l.indexMaxPoints)continue;if(d.source=null,0!==e.length){c>1&&console.time("clipping");var g,m,y,v,x,w,S=.5*l.buffer/l.extent,b=.5-S,I=.5+S,M=1+S;g=m=y=v=null,x=K(e,h,i-S,i+I,0,d.minX,d.maxX,l),w=K(e,h,i+b,i+M,0,d.minX,d.maxX,l),e=null,x&&(g=K(x,h,o-S,o+I,1,d.minY,d.maxY,l),m=K(x,h,o+b,o+M,1,d.minY,d.maxY,l),x=null),w&&(y=K(w,h,o-S,o+I,1,d.minY,d.maxY,l),v=K(w,h,o+b,o+M,1,d.minY,d.maxY,l),w=null),c>1&&console.timeEnd("clipping"),a.push(g||[],t+1,2*i,2*o),a.push(m||[],t+1,2*i,2*o+1),a.push(y||[],t+1,2*i+1,2*o),a.push(v||[],t+1,2*i+1,2*o+1);}}},de.prototype.getTile=function(e,t,i){var o=this.options,r=o.extent,s=o.debug;if(e<0||e>24)return null;var n=1<<e,a=pe(e,t=(t%n+n)%n,i);if(this.tiles[a])return ae(this.tiles[a],r);s>1&&console.log("drilling down to z%d-%d-%d",e,t,i);for(var l,c=e,h=t,u=i;!l&&c>0;)c--,h=Math.floor(h/2),u=Math.floor(u/2),l=this.tiles[pe(c,h,u)];return l&&l.source?(s>1&&console.log("found parent tile z%d-%d-%d",c,h,u),s>1&&console.time("drilling down"),this.splitTile(l.source,c,h,u,e,t,i),s>1&&console.timeEnd("drilling down"),this.tiles[a]?ae(this.tiles[a],r):null):null};class ve extends n{constructor(t,i,o,r){super(t,i,o,ye),this._dataUpdateable=new Map,this.loadGeoJSON=(t,i)=>{const{promoteId:o}=t;if(t.request)return e.getJSON(t.request,((e,t,r,s)=>{this._dataUpdateable=ge(t,o)?me(t,o):void 0,i(e,t,r,s);}));if("string"==typeof t.data)try{const e=JSON.parse(t.data);this._dataUpdateable=ge(e,o)?me(e,o):void 0,i(null,e);}catch(e){i(new Error(`Input data given to '${t.source}' is not a valid GeoJSON object.`));}else t.dataDiff?this._dataUpdateable?(function(e,t,i){var o,r,s,n;if(t.removeAll&&e.clear(),t.remove)for(const i of t.remove)e.delete(i);if(t.add)for(const o of t.add){const t=fe(o,i);null!=t&&e.set(t,o);}if(t.update)for(const i of t.update){let t=e.get(i.id);if(null==t)continue;const a=!i.removeAllProperties&&((null===(o=i.removeProperties)||void 0===o?void 0:o.length)>0||(null===(r=i.addOrUpdateProperties)||void 0===r?void 0:r.length)>0);if((i.newGeometry||i.removeAllProperties||a)&&(t={...t},e.set(i.id,t),a&&(t.properties={...t.properties})),i.newGeometry&&(t.geometry=i.newGeometry),i.removeAllProperties)t.properties={};else if((null===(s=i.removeProperties)||void 0===s?void 0:s.length)>0)for(const e of i.removeProperties)Object.prototype.hasOwnProperty.call(t.properties,e)&&delete t.properties[e];if((null===(n=i.addOrUpdateProperties)||void 0===n?void 0:n.length)>0)for(const{key:e,value:o}of i.addOrUpdateProperties)t.properties[e]=o;}}(this._dataUpdateable,t.dataDiff,o),i(null,{type:"FeatureCollection",features:Array.from(this._dataUpdateable.values())})):i(new Error(`Cannot update existing geojson data in ${t.source}`)):i(new Error(`Input data given to '${t.source}' is not a valid GeoJSON object.`));return {cancel:()=>{}}},r&&(this.loadGeoJSON=r);}loadData(t,i){var o;null===(o=this._pendingRequest)||void 0===o||o.cancel(),this._pendingCallback&&this._pendingCallback(null,{abandoned:!0});const r=!!(t&&t.request&&t.request.collectResourceTiming)&&new e.RequestPerformance(t.request);this._pendingCallback=i,this._pendingRequest=this.loadGeoJSON(t,((o,s)=>{if(delete this._pendingCallback,delete this._pendingRequest,o||!s)return i(o);if("object"!=typeof s)return i(new Error(`Input data given to '${t.source}' is not a valid GeoJSON object.`));{h(s,!0);try{if(t.filter){const i=e.createExpression(t.filter,{type:"boolean","property-type":"data-driven",overridable:!1,transition:!1});if("error"===i.result)throw new Error(i.value.map((e=>`${e.key}: ${e.message}`)).join(", "));const o=s.features.filter((e=>i.value.evaluate({zoom:0},e)));s={type:"FeatureCollection",features:o};}this._geoJSONIndex=t.cluster?new z(function({superclusterOptions:t,clusterProperties:i}){if(!i||!t)return t;const o={},r={},s={accumulated:null,zoom:0},n={properties:null},a=Object.keys(i);for(const t of a){const[s,n]=i[t],a=e.createExpression(n),l=e.createExpression("string"==typeof s?[s,["accumulated"],["get",t]]:s);o[t]=a.value,r[t]=l.value;}return t.map=e=>{n.properties=e;const t={};for(const e of a)t[e]=o[e].evaluate(s,n);return t},t.reduce=(e,t)=>{n.properties=t;for(const t of a)s.accumulated=e[t],e[t]=r[t].evaluate(s,n);},t}(t)).load(s.features):function(e,t){return new de(e,t)}(s,t.geojsonVtOptions);}catch(o){return i(o)}this.loaded={};const n={};if(r){const e=r.finish();e&&(n.resourceTiming={},n.resourceTiming[t.source]=JSON.parse(JSON.stringify(e)));}i(null,n);}}));}reloadTile(e,t){const i=this.loaded;return i&&i[e.uid]?super.reloadTile(e,t):this.loadTile(e,t)}removeSource(e,t){this._pendingCallback&&this._pendingCallback(null,{abandoned:!0}),t();}getClusterExpansionZoom(e,t){try{t(null,this._geoJSONIndex.getClusterExpansionZoom(e.clusterId));}catch(e){t(e);}}getClusterChildren(e,t){try{t(null,this._geoJSONIndex.getChildren(e.clusterId));}catch(e){t(e);}}getClusterLeaves(e,t){try{t(null,this._geoJSONIndex.getLeaves(e.clusterId,e.limit,e.offset));}catch(e){t(e);}}}class xe{constructor(t){this.self=t,this.actor=new e.Actor(t,this),this.layerIndexes={},this.availableImages={},this.workerSourceTypes={vector:n,geojson:ve},this.workerSources={},this.demWorkerSources={},this.self.registerWorkerSource=(e,t)=>{if(this.workerSourceTypes[e])throw new Error(`Worker source with name "${e}" already registered.`);this.workerSourceTypes[e]=t;},this.self.registerRTLTextPlugin=t=>{if(e.plugin.isParsed())throw new Error("RTL text plugin already registered.");e.plugin.applyArabicShaping=t.applyArabicShaping,e.plugin.processBidirectionalText=t.processBidirectionalText,e.plugin.processStyledBidirectionalText=t.processStyledBidirectionalText;};}setReferrer(e,t){this.referrer=t;}setImages(e,t,i){this.availableImages[e]=t;for(const i in this.workerSources[e]){const o=this.workerSources[e][i];for(const e in o)o[e].availableImages=t;}i();}setLayers(e,t,i){this.getLayerIndex(e).replace(t),i();}updateLayers(e,t,i){this.getLayerIndex(e).update(t.layers,t.removedIds),i();}loadTile(e,t,i){this.getWorkerSource(e,t.type,t.source).loadTile(t,i);}loadDEMTile(e,t,i){this.getDEMWorkerSource(e,t.source).loadTile(t,i);}reloadTile(e,t,i){this.getWorkerSource(e,t.type,t.source).reloadTile(t,i);}abortTile(e,t,i){this.getWorkerSource(e,t.type,t.source).abortTile(t,i);}removeTile(e,t,i){this.getWorkerSource(e,t.type,t.source).removeTile(t,i);}removeDEMTile(e,t){this.getDEMWorkerSource(e,t.source).removeTile(t);}removeSource(e,t,i){if(!this.workerSources[e]||!this.workerSources[e][t.type]||!this.workerSources[e][t.type][t.source])return;const o=this.workerSources[e][t.type][t.source];delete this.workerSources[e][t.type][t.source],void 0!==o.removeSource?o.removeSource(t,i):i();}loadWorkerSource(e,t,i){try{this.self.importScripts(t.url),i();}catch(e){i(e.toString());}}syncRTLPluginState(t,i,o){try{e.plugin.setState(i);const t=e.plugin.getPluginURL();if(e.plugin.isLoaded()&&!e.plugin.isParsed()&&null!=t){this.self.importScripts(t);const i=e.plugin.isParsed();o(i?void 0:new Error(`RTL Text Plugin failed to import scripts from ${t}`),i);}}catch(e){o(e.toString());}}getAvailableImages(e){let t=this.availableImages[e];return t||(t=[]),t}getLayerIndex(e){let i=this.layerIndexes[e];return i||(i=this.layerIndexes[e]=new t),i}getWorkerSource(e,t,i){if(this.workerSources[e]||(this.workerSources[e]={}),this.workerSources[e][t]||(this.workerSources[e][t]={}),!this.workerSources[e][t][i]){const o={send:(t,i,o)=>{this.actor.send(t,i,o,e);}};this.workerSources[e][t][i]=new this.workerSourceTypes[t](o,this.getLayerIndex(e),this.getAvailableImages(e));}return this.workerSources[e][t][i]}getDEMWorkerSource(e,t){return this.demWorkerSources[e]||(this.demWorkerSources[e]={}),this.demWorkerSources[e][t]||(this.demWorkerSources[e][t]=new a),this.demWorkerSources[e][t]}}return e.isWorker()&&(self.worker=new xe(self)),xe}));

    define(["./shared"],(function(t){var e="3.3.1";class i{static testProp(t){if(!i.docStyle)return t[0];for(let e=0;e<t.length;e++)if(t[e]in i.docStyle)return t[e];return t[0]}static create(t,e,i){const s=window.document.createElement(t);return void 0!==e&&(s.className=e),i&&i.appendChild(s),s}static createNS(t,e){return window.document.createElementNS(t,e)}static disableDrag(){i.docStyle&&i.selectProp&&(i.userSelect=i.docStyle[i.selectProp],i.docStyle[i.selectProp]="none");}static enableDrag(){i.docStyle&&i.selectProp&&(i.docStyle[i.selectProp]=i.userSelect);}static setTransform(t,e){t.style[i.transformProp]=e;}static addEventListener(t,e,i,s={}){t.addEventListener(e,i,"passive"in s?s:s.capture);}static removeEventListener(t,e,i,s={}){t.removeEventListener(e,i,"passive"in s?s:s.capture);}static suppressClickInternal(t){t.preventDefault(),t.stopPropagation(),window.removeEventListener("click",i.suppressClickInternal,!0);}static suppressClick(){window.addEventListener("click",i.suppressClickInternal,!0),window.setTimeout((()=>{window.removeEventListener("click",i.suppressClickInternal,!0);}),0);}static mousePos(e,i){const s=e.getBoundingClientRect();return new t.Point(i.clientX-s.left-e.clientLeft,i.clientY-s.top-e.clientTop)}static touchPos(e,i){const s=e.getBoundingClientRect(),a=[];for(let o=0;o<i.length;o++)a.push(new t.Point(i[o].clientX-s.left-e.clientLeft,i[o].clientY-s.top-e.clientTop));return a}static mouseButton(t){return t.button}static remove(t){t.parentNode&&t.parentNode.removeChild(t);}}i.docStyle="undefined"!=typeof window&&window.document&&window.document.documentElement.style,i.selectProp=i.testProp(["userSelect","MozUserSelect","WebkitUserSelect","msUserSelect"]),i.transformProp=i.testProp(["transform","WebkitTransform"]);const s={supported:!1,testSupport:function(t){!r&&o&&(n?l(t):a=t);}};let a,o,r=!1,n=!1;function l(t){const e=t.createTexture();t.bindTexture(t.TEXTURE_2D,e);try{if(t.texImage2D(t.TEXTURE_2D,0,t.RGBA,t.RGBA,t.UNSIGNED_BYTE,o),t.isContextLost())return;s.supported=!0;}catch(t){}t.deleteTexture(e),r=!0;}var c,h;"undefined"!=typeof document&&(o=document.createElement("img"),o.onload=function(){a&&l(a),a=null,n=!0;},o.onerror=function(){r=!0,a=null;},o.src="data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAQAAAAfQ//73v/+BiOh/AAA="),function(e){let i,a,o,r;e.resetRequestQueue=()=>{i=[],a=0,o=0,r={};},e.addThrottleControl=t=>{const e=o++;return r[e]=t,e},e.removeThrottleControl=t=>{delete r[t],c();},e.getImage=(t,e,o=!0)=>{s.supported&&(t.headers||(t.headers={}),t.headers.accept="image/webp,*/*");const r={requestParameters:t,supportImageRefresh:o,callback:e,cancelled:!1,completed:!1,cancel:()=>{r.completed||r.cancelled||(r.cancelled=!0,r.innerRequest&&(r.innerRequest.cancel(),a--),c());}};return i.push(r),c(),r};const n=e=>{const{requestParameters:i,supportImageRefresh:s,callback:a}=e;return t.extend(i,{type:"image"}),(!1!==s||t.isWorker()||t.getProtocolAction(i.url)||i.headers&&!Object.keys(i.headers).reduce(((t,e)=>t&&"accept"===e),!0)?t.makeRequest:h)(i,((t,i,s,o)=>{l(e,a,t,i,s,o);}))},l=(e,i,s,o,r,n)=>{s?i(s):o instanceof HTMLImageElement||t.isImageBitmap(o)?i(null,o):o&&((e,i)=>{"function"==typeof createImageBitmap?t.arrayBufferToImageBitmap(e,i):t.arrayBufferToImage(e,i);})(o,((t,e)=>{null!=t?i(t):null!=e&&i(null,e,{cacheControl:r,expires:n});})),e.cancelled||(e.completed=!0,a--,c());},c=()=>{const e=(()=>{const t=Object.keys(r);let e=!1;if(t.length>0)for(const i of t)if(e=r[i](),e)break;return e})()?t.config.MAX_PARALLEL_IMAGE_REQUESTS_PER_FRAME:t.config.MAX_PARALLEL_IMAGE_REQUESTS;for(let t=a;t<e&&i.length>0;t++){const e=i.shift();if(e.cancelled){t--;continue}const s=n(e);a++,e.innerRequest=s;}},h=(e,i)=>{const s=new Image,a=e.url;let o=!1;const r=e.credentials;return r&&"include"===r?s.crossOrigin="use-credentials":(r&&"same-origin"===r||!t.sameOrigin(a))&&(s.crossOrigin="anonymous"),s.fetchPriority="high",s.onload=()=>{i(null,s),s.onerror=s.onload=null;},s.onerror=()=>{o||i(new Error("Could not load image. Please make sure to use a supported image type such as PNG or JPEG. Note that SVGs are not supported.")),s.onerror=s.onload=null;},s.src=a,{cancel:()=>{o=!0,s.src="";}}};}(c||(c={})),c.resetRequestQueue(),function(t){t.Glyphs="Glyphs",t.Image="Image",t.Source="Source",t.SpriteImage="SpriteImage",t.SpriteJSON="SpriteJSON",t.Style="Style",t.Tile="Tile",t.Unknown="Unknown";}(h||(h={}));class u{constructor(t){this._transformRequestFn=t;}transformRequest(t,e){return this._transformRequestFn&&this._transformRequestFn(t,e)||{url:t}}normalizeSpriteURL(t,e,i){const s=function(t){const e=t.match(d);if(!e)throw new Error(`Unable to parse URL "${t}"`);return {protocol:e[1],authority:e[2],path:e[3]||"/",params:e[4]?e[4].split("&"):[]}}(t);return s.path+=`${e}${i}`,function(t){const e=t.params.length?`?${t.params.join("&")}`:"";return `${t.protocol}://${t.authority}${t.path}${e}`}(s)}setTransformRequest(t){this._transformRequestFn=t;}}const d=/^(\w+):\/\/([^/?]*)(\/[^?]+)?\??(.+)?/;function _(e){var i=new t.ARRAY_TYPE(3);return i[0]=e[0],i[1]=e[1],i[2]=e[2],i}var m,p=function(t,e,i){return t[0]=e[0]-i[0],t[1]=e[1]-i[1],t[2]=e[2]-i[2],t};m=new t.ARRAY_TYPE(3),t.ARRAY_TYPE!=Float32Array&&(m[0]=0,m[1]=0,m[2]=0);var f=function(t){var e=t[0],i=t[1];return e*e+i*i};function g(t){const e=[];if("string"==typeof t)e.push({id:"default",url:t});else if(t&&t.length>0){const i=[];for(const{id:s,url:a}of t){const t=`${s}${a}`;-1===i.indexOf(t)&&(i.push(t),e.push({id:s,url:a}));}}return e}function v(e,i,s,a,o){if(a)return void e(a);if(o!==Object.values(i).length||o!==Object.values(s).length)return;const r={};for(const e in i){r[e]={};const a=t.browser.getImageCanvasContext(s[e]),o=i[e];for(const t in o){const{width:i,height:s,x:n,y:l,sdf:c,pixelRatio:h,stretchX:u,stretchY:d,content:_}=o[t];r[e][t]={data:null,pixelRatio:h,sdf:c,stretchX:u,stretchY:d,content:_,spriteData:{width:i,height:s,x:n,y:l,context:a}};}}e(null,r);}!function(){var e=new t.ARRAY_TYPE(2);t.ARRAY_TYPE!=Float32Array&&(e[0]=0,e[1]=0);}();class x{constructor(t,e,i,s){this.context=t,this.format=i,this.texture=t.gl.createTexture(),this.update(e,s);}update(e,i,s){const{width:a,height:o}=e,r=!(this.size&&this.size[0]===a&&this.size[1]===o||s),{context:n}=this,{gl:l}=n;if(this.useMipmap=Boolean(i&&i.useMipmap),l.bindTexture(l.TEXTURE_2D,this.texture),n.pixelStoreUnpackFlipY.set(!1),n.pixelStoreUnpack.set(1),n.pixelStoreUnpackPremultiplyAlpha.set(this.format===l.RGBA&&(!i||!1!==i.premultiply)),r)this.size=[a,o],e instanceof HTMLImageElement||e instanceof HTMLCanvasElement||e instanceof HTMLVideoElement||e instanceof ImageData||t.isImageBitmap(e)?l.texImage2D(l.TEXTURE_2D,0,this.format,this.format,l.UNSIGNED_BYTE,e):l.texImage2D(l.TEXTURE_2D,0,this.format,a,o,0,this.format,l.UNSIGNED_BYTE,e.data);else {const{x:i,y:r}=s||{x:0,y:0};e instanceof HTMLImageElement||e instanceof HTMLCanvasElement||e instanceof HTMLVideoElement||e instanceof ImageData||t.isImageBitmap(e)?l.texSubImage2D(l.TEXTURE_2D,0,i,r,l.RGBA,l.UNSIGNED_BYTE,e):l.texSubImage2D(l.TEXTURE_2D,0,i,r,a,o,l.RGBA,l.UNSIGNED_BYTE,e.data);}this.useMipmap&&this.isSizePowerOfTwo()&&l.generateMipmap(l.TEXTURE_2D);}bind(t,e,i){const{context:s}=this,{gl:a}=s;a.bindTexture(a.TEXTURE_2D,this.texture),i!==a.LINEAR_MIPMAP_NEAREST||this.isSizePowerOfTwo()||(i=a.LINEAR),t!==this.filter&&(a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MAG_FILTER,t),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MIN_FILTER,i||t),this.filter=t),e!==this.wrap&&(a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_S,e),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_T,e),this.wrap=e);}isSizePowerOfTwo(){return this.size[0]===this.size[1]&&Math.log(this.size[0])/Math.LN2%1==0}destroy(){const{gl:t}=this.context;t.deleteTexture(this.texture),this.texture=null;}}function y(t){const{userImage:e}=t;return !!(e&&e.render&&e.render())&&(t.data.replace(new Uint8Array(e.data.buffer)),!0)}class b extends t.Evented{constructor(){super(),this.images={},this.updatedImages={},this.callbackDispatchedThisFrame={},this.loaded=!1,this.requestors=[],this.patterns={},this.atlasImage=new t.RGBAImage({width:1,height:1}),this.dirty=!0;}isLoaded(){return this.loaded}setLoaded(t){if(this.loaded!==t&&(this.loaded=t,t)){for(const{ids:t,callback:e}of this.requestors)this._notify(t,e);this.requestors=[];}}getImage(e){const i=this.images[e];if(i&&!i.data&&i.spriteData){const e=i.spriteData;i.data=new t.RGBAImage({width:e.width,height:e.height},e.context.getImageData(e.x,e.y,e.width,e.height).data),i.spriteData=null;}return i}addImage(t,e){if(this.images[t])throw new Error(`Image id ${t} already exist, use updateImage instead`);this._validate(t,e)&&(this.images[t]=e);}_validate(e,i){let s=!0;const a=i.data||i.spriteData;return this._validateStretch(i.stretchX,a&&a.width)||(this.fire(new t.ErrorEvent(new Error(`Image "${e}" has invalid "stretchX" value`))),s=!1),this._validateStretch(i.stretchY,a&&a.height)||(this.fire(new t.ErrorEvent(new Error(`Image "${e}" has invalid "stretchY" value`))),s=!1),this._validateContent(i.content,i)||(this.fire(new t.ErrorEvent(new Error(`Image "${e}" has invalid "content" value`))),s=!1),s}_validateStretch(t,e){if(!t)return !0;let i=0;for(const s of t){if(s[0]<i||s[1]<s[0]||e<s[1])return !1;i=s[1];}return !0}_validateContent(t,e){if(!t)return !0;if(4!==t.length)return !1;const i=e.spriteData,s=i&&i.width||e.data.width,a=i&&i.height||e.data.height;return !(t[0]<0||s<t[0]||t[1]<0||a<t[1]||t[2]<0||s<t[2]||t[3]<0||a<t[3]||t[2]<t[0]||t[3]<t[1])}updateImage(t,e,i=!0){const s=this.getImage(t);if(i&&(s.data.width!==e.data.width||s.data.height!==e.data.height))throw new Error(`size mismatch between old image (${s.data.width}x${s.data.height}) and new image (${e.data.width}x${e.data.height}).`);e.version=s.version+1,this.images[t]=e,this.updatedImages[t]=!0;}removeImage(t){const e=this.images[t];delete this.images[t],delete this.patterns[t],e.userImage&&e.userImage.onRemove&&e.userImage.onRemove();}listImages(){return Object.keys(this.images)}getImages(t,e){let i=!0;if(!this.isLoaded())for(const e of t)this.images[e]||(i=!1);this.isLoaded()||i?this._notify(t,e):this.requestors.push({ids:t,callback:e});}_notify(e,i){const s={};for(const i of e){let e=this.getImage(i);e||(this.fire(new t.Event("styleimagemissing",{id:i})),e=this.getImage(i)),e?s[i]={data:e.data.clone(),pixelRatio:e.pixelRatio,sdf:e.sdf,version:e.version,stretchX:e.stretchX,stretchY:e.stretchY,content:e.content,hasRenderCallback:Boolean(e.userImage&&e.userImage.render)}:t.warnOnce(`Image "${i}" could not be loaded. Please make sure you have added the image with map.addImage() or a "sprite" property in your style. You can provide missing images by listening for the "styleimagemissing" map event.`);}i(null,s);}getPixelSize(){const{width:t,height:e}=this.atlasImage;return {width:t,height:e}}getPattern(e){const i=this.patterns[e],s=this.getImage(e);if(!s)return null;if(i&&i.position.version===s.version)return i.position;if(i)i.position.version=s.version;else {const i={w:s.data.width+2,h:s.data.height+2,x:0,y:0},a=new t.ImagePosition(i,s);this.patterns[e]={bin:i,position:a};}return this._updatePatternAtlas(),this.patterns[e].position}bind(t){const e=t.gl;this.atlasTexture?this.dirty&&(this.atlasTexture.update(this.atlasImage),this.dirty=!1):this.atlasTexture=new x(t,this.atlasImage,e.RGBA),this.atlasTexture.bind(e.LINEAR,e.CLAMP_TO_EDGE);}_updatePatternAtlas(){const e=[];for(const t in this.patterns)e.push(this.patterns[t].bin);const{w:i,h:s}=t.potpack(e),a=this.atlasImage;a.resize({width:i||1,height:s||1});for(const e in this.patterns){const{bin:i}=this.patterns[e],s=i.x+1,o=i.y+1,r=this.getImage(e).data,n=r.width,l=r.height;t.RGBAImage.copy(r,a,{x:0,y:0},{x:s,y:o},{width:n,height:l}),t.RGBAImage.copy(r,a,{x:0,y:l-1},{x:s,y:o-1},{width:n,height:1}),t.RGBAImage.copy(r,a,{x:0,y:0},{x:s,y:o+l},{width:n,height:1}),t.RGBAImage.copy(r,a,{x:n-1,y:0},{x:s-1,y:o},{width:1,height:l}),t.RGBAImage.copy(r,a,{x:0,y:0},{x:s+n,y:o},{width:1,height:l});}this.dirty=!0;}beginFrame(){this.callbackDispatchedThisFrame={};}dispatchRenderCallbacks(e){for(const i of e){if(this.callbackDispatchedThisFrame[i])continue;this.callbackDispatchedThisFrame[i]=!0;const e=this.getImage(i);e||t.warnOnce(`Image with ID: "${i}" was not found`),y(e)&&this.updateImage(i,e);}}}const w=1e20;function T(t,e,i,s,a,o,r,n,l){for(let c=e;c<e+s;c++)E(t,i*o+c,o,a,r,n,l);for(let c=i;c<i+a;c++)E(t,c*o+e,1,s,r,n,l);}function E(t,e,i,s,a,o,r){o[0]=0,r[0]=-w,r[1]=w,a[0]=t[e];for(let n=1,l=0,c=0;n<s;n++){a[n]=t[e+n*i];const s=n*n;do{const t=o[l];c=(a[n]-a[t]+s-t*t)/(n-t)/2;}while(c<=r[l]&&--l>-1);l++,o[l]=n,r[l]=c,r[l+1]=w;}for(let n=0,l=0;n<s;n++){for(;r[l+1]<n;)l++;const s=o[l],c=n-s;t[e+n*i]=a[s]+c*c;}}class I{constructor(t,e){this.requestManager=t,this.localIdeographFontFamily=e,this.entries={};}setURL(t){this.url=t;}getGlyphs(e,i){const s=[];for(const t in e)for(const i of e[t])s.push({stack:t,id:i});t.asyncAll(s,(({stack:t,id:e},i)=>{let s=this.entries[t];s||(s=this.entries[t]={glyphs:{},requests:{},ranges:{}});let a=s.glyphs[e];if(void 0!==a)return void i(null,{stack:t,id:e,glyph:a});if(a=this._tinySDF(s,t,e),a)return s.glyphs[e]=a,void i(null,{stack:t,id:e,glyph:a});const o=Math.floor(e/256);if(256*o>65535)return void i(new Error("glyphs > 65535 not supported"));if(s.ranges[o])return void i(null,{stack:t,id:e,glyph:a});if(!this.url)return void i(new Error("glyphsUrl is not set"));let r=s.requests[o];r||(r=s.requests[o]=[],I.loadGlyphRange(t,o,this.url,this.requestManager,((t,e)=>{if(e){for(const t in e)this._doesCharSupportLocalGlyph(+t)||(s.glyphs[+t]=e[+t]);s.ranges[o]=!0;}for(const i of r)i(t,e);delete s.requests[o];}))),r.push(((s,a)=>{s?i(s):a&&i(null,{stack:t,id:e,glyph:a[e]||null});}));}),((t,e)=>{if(t)i(t);else if(e){const t={};for(const{stack:i,id:s,glyph:a}of e)(t[i]||(t[i]={}))[s]=a&&{id:a.id,bitmap:a.bitmap.clone(),metrics:a.metrics};i(null,t);}}));}_doesCharSupportLocalGlyph(e){return !!this.localIdeographFontFamily&&(t.unicodeBlockLookup["CJK Unified Ideographs"](e)||t.unicodeBlockLookup["Hangul Syllables"](e)||t.unicodeBlockLookup.Hiragana(e)||t.unicodeBlockLookup.Katakana(e))}_tinySDF(e,i,s){const a=this.localIdeographFontFamily;if(!a)return;if(!this._doesCharSupportLocalGlyph(s))return;let o=e.tinySDF;if(!o){let t="400";/bold/i.test(i)?t="900":/medium/i.test(i)?t="500":/light/i.test(i)&&(t="200"),o=e.tinySDF=new I.TinySDF({fontSize:24,buffer:3,radius:8,cutoff:.25,fontFamily:a,fontWeight:t});}const r=o.draw(String.fromCharCode(s));return {id:s,bitmap:new t.AlphaImage({width:r.width||30,height:r.height||30},r.data),metrics:{width:r.glyphWidth||24,height:r.glyphHeight||24,left:r.glyphLeft||0,top:r.glyphTop-27||-8,advance:r.glyphAdvance||24}}}}I.loadGlyphRange=function(e,i,s,a,o){const r=256*i,n=r+255,l=a.transformRequest(s.replace("{fontstack}",e).replace("{range}",`${r}-${n}`),h.Glyphs);t.getArrayBuffer(l,((e,i)=>{if(e)o(e);else if(i){const e={};for(const s of t.parseGlyphPbf(i))e[s.id]=s;o(null,e);}}));},I.TinySDF=class{constructor({fontSize:t=24,buffer:e=3,radius:i=8,cutoff:s=.25,fontFamily:a="sans-serif",fontWeight:o="normal",fontStyle:r="normal"}={}){this.buffer=e,this.cutoff=s,this.radius=i;const n=this.size=t+4*e,l=this._createCanvas(n),c=this.ctx=l.getContext("2d",{willReadFrequently:!0});c.font=`${r} ${o} ${t}px ${a}`,c.textBaseline="alphabetic",c.textAlign="left",c.fillStyle="black",this.gridOuter=new Float64Array(n*n),this.gridInner=new Float64Array(n*n),this.f=new Float64Array(n),this.z=new Float64Array(n+1),this.v=new Uint16Array(n);}_createCanvas(t){const e=document.createElement("canvas");return e.width=e.height=t,e}draw(t){const{width:e,actualBoundingBoxAscent:i,actualBoundingBoxDescent:s,actualBoundingBoxLeft:a,actualBoundingBoxRight:o}=this.ctx.measureText(t),r=Math.ceil(i),n=Math.max(0,Math.min(this.size-this.buffer,Math.ceil(o-a))),l=Math.min(this.size-this.buffer,r+Math.ceil(s)),c=n+2*this.buffer,h=l+2*this.buffer,u=Math.max(c*h,0),d=new Uint8ClampedArray(u),_={data:d,width:c,height:h,glyphWidth:n,glyphHeight:l,glyphTop:r,glyphLeft:0,glyphAdvance:e};if(0===n||0===l)return _;const{ctx:m,buffer:p,gridInner:f,gridOuter:g}=this;m.clearRect(p,p,n,l),m.fillText(t,p,p+r);const v=m.getImageData(p,p,n,l);g.fill(w,0,u),f.fill(0,0,u);for(let t=0;t<l;t++)for(let e=0;e<n;e++){const i=v.data[4*(t*n+e)+3]/255;if(0===i)continue;const s=(t+p)*c+e+p;if(1===i)g[s]=0,f[s]=w;else {const t=.5-i;g[s]=t>0?t*t:0,f[s]=t<0?t*t:0;}}T(g,0,0,c,h,c,this.f,this.v,this.z),T(f,p,p,n,l,c,this.f,this.v,this.z);for(let t=0;t<u;t++){const e=Math.sqrt(g[t])-Math.sqrt(f[t]);d[t]=Math.round(255-255*(e/this.radius+this.cutoff));}return _}};class S{constructor(){this.specification=t.v8Spec.light.position;}possiblyEvaluate(e,i){return t.sphericalToCartesian(e.expression.evaluate(i))}interpolate(e,i,s){return {x:t.interpolate.number(e.x,i.x,s),y:t.interpolate.number(e.y,i.y,s),z:t.interpolate.number(e.z,i.z,s)}}}let C,P;class D extends t.Evented{constructor(e){super(),C=C||new t.Properties({anchor:new t.DataConstantProperty(t.v8Spec.light.anchor),position:new S,color:new t.DataConstantProperty(t.v8Spec.light.color),intensity:new t.DataConstantProperty(t.v8Spec.light.intensity)}),this._transitionable=new t.Transitionable(C),this.setLight(e),this._transitioning=this._transitionable.untransitioned();}getLight(){return this._transitionable.serialize()}setLight(e,i={}){if(!this._validate(t.validateLight,e,i))for(const t in e){const i=e[t];t.endsWith("-transition")?this._transitionable.setTransition(t.slice(0,-11),i):this._transitionable.setValue(t,i);}}updateTransitions(t){this._transitioning=this._transitionable.transitioned(t,this._transitioning);}hasTransition(){return this._transitioning.hasTransition()}recalculate(t){this.properties=this._transitioning.possiblyEvaluate(t);}_validate(e,i,s){return (!s||!1!==s.validate)&&t.emitValidationErrors(this,e.call(t.validateStyle,t.extend({value:i,style:{glyphs:!0,sprite:!0},styleSpec:t.v8Spec})))}}class M{constructor(t,e){this.width=t,this.height=e,this.nextRow=0,this.data=new Uint8Array(this.width*this.height),this.dashEntry={};}getDash(t,e){const i=t.join(",")+String(e);return this.dashEntry[i]||(this.dashEntry[i]=this.addDash(t,e)),this.dashEntry[i]}getDashRanges(t,e,i){const s=[];let a=t.length%2==1?-t[t.length-1]*i:0,o=t[0]*i,r=!0;s.push({left:a,right:o,isDash:r,zeroLength:0===t[0]});let n=t[0];for(let e=1;e<t.length;e++){r=!r;const l=t[e];a=n*i,n+=l,o=n*i,s.push({left:a,right:o,isDash:r,zeroLength:0===l});}return s}addRoundDash(t,e,i){const s=e/2;for(let e=-i;e<=i;e++){const a=this.width*(this.nextRow+i+e);let o=0,r=t[o];for(let n=0;n<this.width;n++){n/r.right>1&&(r=t[++o]);const l=Math.abs(n-r.left),c=Math.abs(n-r.right),h=Math.min(l,c);let u;const d=e/i*(s+1);if(r.isDash){const t=s-Math.abs(d);u=Math.sqrt(h*h+t*t);}else u=s-Math.sqrt(h*h+d*d);this.data[a+n]=Math.max(0,Math.min(255,u+128));}}}addRegularDash(t){for(let e=t.length-1;e>=0;--e){const i=t[e],s=t[e+1];i.zeroLength?t.splice(e,1):s&&s.isDash===i.isDash&&(s.left=i.left,t.splice(e,1));}const e=t[0],i=t[t.length-1];e.isDash===i.isDash&&(e.left=i.left-this.width,i.right=e.right+this.width);const s=this.width*this.nextRow;let a=0,o=t[a];for(let e=0;e<this.width;e++){e/o.right>1&&(o=t[++a]);const i=Math.abs(e-o.left),r=Math.abs(e-o.right),n=Math.min(i,r);this.data[s+e]=Math.max(0,Math.min(255,(o.isDash?n:-n)+128));}}addDash(e,i){const s=i?7:0,a=2*s+1;if(this.nextRow+a>this.height)return t.warnOnce("LineAtlas out of space"),null;let o=0;for(let t=0;t<e.length;t++)o+=e[t];if(0!==o){const t=this.width/o,a=this.getDashRanges(e,this.width,t);i?this.addRoundDash(a,t,s):this.addRegularDash(a);}const r={y:(this.nextRow+s+.5)/this.height,height:2*s/this.height,width:o};return this.nextRow+=a,this.dirty=!0,r}bind(t){const e=t.gl;this.texture?(e.bindTexture(e.TEXTURE_2D,this.texture),this.dirty&&(this.dirty=!1,e.texSubImage2D(e.TEXTURE_2D,0,0,0,this.width,this.height,e.ALPHA,e.UNSIGNED_BYTE,this.data))):(this.texture=e.createTexture(),e.bindTexture(e.TEXTURE_2D,this.texture),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.REPEAT),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.REPEAT),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texImage2D(e.TEXTURE_2D,0,e.ALPHA,this.width,this.height,0,e.ALPHA,e.UNSIGNED_BYTE,this.data));}}class z{constructor(t,e,i){this.workerPool=t,this.actors=[],this.currentActor=0,this.id=i;const s=this.workerPool.acquire(i);for(let t=0;t<s.length;t++){const a=new z.Actor(s[t],e,i);a.name=`Worker ${t}`,this.actors.push(a);}if(!this.actors.length)throw new Error("No actors found")}broadcast(e,i,s){t.asyncAll(this.actors,((t,s)=>{t.send(e,i,s);}),s=s||function(){});}getActor(){return this.currentActor=(this.currentActor+1)%this.actors.length,this.actors[this.currentActor]}remove(t=!0){this.actors.forEach((t=>{t.remove();})),this.actors=[],t&&this.workerPool.release(this.id);}}function A(e,i,s){const a=function(i,a){if(i)return s(i);if(a){const i=t.pick(t.extend(a,e),["tiles","minzoom","maxzoom","attribution","bounds","scheme","tileSize","encoding"]);a.vector_layers&&(i.vectorLayers=a.vector_layers,i.vectorLayerIds=i.vectorLayers.map((t=>t.id))),s(null,i);}};return e.url?t.getJSON(i.transformRequest(e.url,h.Source),a):t.browser.frame((()=>a(null,e)))}z.Actor=t.Actor;class L{constructor(t,e){t&&(e?this.setSouthWest(t).setNorthEast(e):Array.isArray(t)&&(4===t.length?this.setSouthWest([t[0],t[1]]).setNorthEast([t[2],t[3]]):this.setSouthWest(t[0]).setNorthEast(t[1])));}setNorthEast(e){return this._ne=e instanceof t.LngLat?new t.LngLat(e.lng,e.lat):t.LngLat.convert(e),this}setSouthWest(e){return this._sw=e instanceof t.LngLat?new t.LngLat(e.lng,e.lat):t.LngLat.convert(e),this}extend(e){const i=this._sw,s=this._ne;let a,o;if(e instanceof t.LngLat)a=e,o=e;else {if(!(e instanceof L))return Array.isArray(e)?4===e.length||e.every(Array.isArray)?this.extend(L.convert(e)):this.extend(t.LngLat.convert(e)):e&&("lng"in e||"lon"in e)&&"lat"in e?this.extend(t.LngLat.convert(e)):this;if(a=e._sw,o=e._ne,!a||!o)return this}return i||s?(i.lng=Math.min(a.lng,i.lng),i.lat=Math.min(a.lat,i.lat),s.lng=Math.max(o.lng,s.lng),s.lat=Math.max(o.lat,s.lat)):(this._sw=new t.LngLat(a.lng,a.lat),this._ne=new t.LngLat(o.lng,o.lat)),this}getCenter(){return new t.LngLat((this._sw.lng+this._ne.lng)/2,(this._sw.lat+this._ne.lat)/2)}getSouthWest(){return this._sw}getNorthEast(){return this._ne}getNorthWest(){return new t.LngLat(this.getWest(),this.getNorth())}getSouthEast(){return new t.LngLat(this.getEast(),this.getSouth())}getWest(){return this._sw.lng}getSouth(){return this._sw.lat}getEast(){return this._ne.lng}getNorth(){return this._ne.lat}toArray(){return [this._sw.toArray(),this._ne.toArray()]}toString(){return `LngLatBounds(${this._sw.toString()}, ${this._ne.toString()})`}isEmpty(){return !(this._sw&&this._ne)}contains(e){const{lng:i,lat:s}=t.LngLat.convert(e);let a=this._sw.lng<=i&&i<=this._ne.lng;return this._sw.lng>this._ne.lng&&(a=this._sw.lng>=i&&i>=this._ne.lng),this._sw.lat<=s&&s<=this._ne.lat&&a}static convert(t){return t instanceof L?t:t?new L(t):t}static fromLngLat(e,i=0){const s=360*i/40075017,a=s/Math.cos(Math.PI/180*e.lat);return new L(new t.LngLat(e.lng-a,e.lat-s),new t.LngLat(e.lng+a,e.lat+s))}}class R{constructor(t,e,i){this.bounds=L.convert(this.validateBounds(t)),this.minzoom=e||0,this.maxzoom=i||24;}validateBounds(t){return Array.isArray(t)&&4===t.length?[Math.max(-180,t[0]),Math.max(-90,t[1]),Math.min(180,t[2]),Math.min(90,t[3])]:[-180,-90,180,90]}contains(e){const i=Math.pow(2,e.z),s=Math.floor(t.mercatorXfromLng(this.bounds.getWest())*i),a=Math.floor(t.mercatorYfromLat(this.bounds.getNorth())*i),o=Math.ceil(t.mercatorXfromLng(this.bounds.getEast())*i),r=Math.ceil(t.mercatorYfromLat(this.bounds.getSouth())*i);return e.x>=s&&e.x<o&&e.y>=a&&e.y<r}}class k extends t.Evented{constructor(e,i,s,a){if(super(),this.load=()=>{this._loaded=!1,this.fire(new t.Event("dataloading",{dataType:"source"})),this._tileJSONRequest=A(this._options,this.map._requestManager,((e,i)=>{this._tileJSONRequest=null,this._loaded=!0,this.map.style.sourceCaches[this.id].clearTiles(),e?this.fire(new t.ErrorEvent(e)):i&&(t.extend(this,i),i.bounds&&(this.tileBounds=new R(i.bounds,this.minzoom,this.maxzoom)),this.fire(new t.Event("data",{dataType:"source",sourceDataType:"metadata"})),this.fire(new t.Event("data",{dataType:"source",sourceDataType:"content"})));}));},this.serialize=()=>t.extend({},this._options),this.id=e,this.dispatcher=s,this.type="vector",this.minzoom=0,this.maxzoom=22,this.scheme="xyz",this.tileSize=512,this.reparseOverscaled=!0,this.isTileClipped=!0,this._loaded=!1,t.extend(this,t.pick(i,["url","scheme","tileSize","promoteId"])),this._options=t.extend({type:"vector"},i),this._collectResourceTiming=i.collectResourceTiming,512!==this.tileSize)throw new Error("vector tile sources must have a tileSize of 512");this.setEventedParent(a);}loaded(){return this._loaded}hasTile(t){return !this.tileBounds||this.tileBounds.contains(t.canonical)}onAdd(t){this.map=t,this.load();}setSourceProperty(t){this._tileJSONRequest&&this._tileJSONRequest.cancel(),t(),this.load();}setTiles(t){return this.setSourceProperty((()=>{this._options.tiles=t;})),this}setUrl(t){return this.setSourceProperty((()=>{this.url=t,this._options.url=t;})),this}onRemove(){this._tileJSONRequest&&(this._tileJSONRequest.cancel(),this._tileJSONRequest=null);}loadTile(t,e){const i=t.tileID.canonical.url(this.tiles,this.map.getPixelRatio(),this.scheme),s={request:this.map._requestManager.transformRequest(i,h.Tile),uid:t.uid,tileID:t.tileID,zoom:t.tileID.overscaledZ,tileSize:this.tileSize*t.tileID.overscaleFactor(),type:this.type,source:this.id,pixelRatio:this.map.getPixelRatio(),showCollisionBoxes:this.map.showCollisionBoxes,promoteId:this.promoteId};function a(i,s){return delete t.request,t.aborted?e(null):i&&404!==i.status?e(i):(s&&s.resourceTiming&&(t.resourceTiming=s.resourceTiming),this.map._refreshExpiredTiles&&s&&t.setExpiryData(s),t.loadVectorData(s,this.map.painter),e(null),void(t.reloadCallback&&(this.loadTile(t,t.reloadCallback),t.reloadCallback=null)))}s.request.collectResourceTiming=this._collectResourceTiming,t.actor&&"expired"!==t.state?"loading"===t.state?t.reloadCallback=e:t.request=t.actor.send("reloadTile",s,a.bind(this)):(t.actor=this.dispatcher.getActor(),t.request=t.actor.send("loadTile",s,a.bind(this)));}abortTile(t){t.request&&(t.request.cancel(),delete t.request),t.actor&&t.actor.send("abortTile",{uid:t.uid,type:this.type,source:this.id},void 0);}unloadTile(t){t.unloadVectorData(),t.actor&&t.actor.send("removeTile",{uid:t.uid,type:this.type,source:this.id},void 0);}hasTransition(){return !1}}class F extends t.Evented{constructor(e,i,s,a){super(),this.id=e,this.dispatcher=s,this.setEventedParent(a),this.type="raster",this.minzoom=0,this.maxzoom=22,this.roundZoom=!0,this.scheme="xyz",this.tileSize=512,this._loaded=!1,this._options=t.extend({type:"raster"},i),t.extend(this,t.pick(i,["url","scheme","tileSize"]));}load(){this._loaded=!1,this.fire(new t.Event("dataloading",{dataType:"source"})),this._tileJSONRequest=A(this._options,this.map._requestManager,((e,i)=>{this._tileJSONRequest=null,this._loaded=!0,e?this.fire(new t.ErrorEvent(e)):i&&(t.extend(this,i),i.bounds&&(this.tileBounds=new R(i.bounds,this.minzoom,this.maxzoom)),this.fire(new t.Event("data",{dataType:"source",sourceDataType:"metadata"})),this.fire(new t.Event("data",{dataType:"source",sourceDataType:"content"})));}));}loaded(){return this._loaded}onAdd(t){this.map=t,this.load();}onRemove(){this._tileJSONRequest&&(this._tileJSONRequest.cancel(),this._tileJSONRequest=null);}serialize(){return t.extend({},this._options)}hasTile(t){return !this.tileBounds||this.tileBounds.contains(t.canonical)}loadTile(t,e){const i=t.tileID.canonical.url(this.tiles,this.map.getPixelRatio(),this.scheme);t.request=c.getImage(this.map._requestManager.transformRequest(i,h.Tile),((i,s,a)=>{if(delete t.request,t.aborted)t.state="unloaded",e(null);else if(i)t.state="errored",e(i);else if(s){this.map._refreshExpiredTiles&&a&&t.setExpiryData(a);const i=this.map.painter.context,o=i.gl;t.texture=this.map.painter.getTileTexture(s.width),t.texture?t.texture.update(s,{useMipmap:!0}):(t.texture=new x(i,s,o.RGBA,{useMipmap:!0}),t.texture.bind(o.LINEAR,o.CLAMP_TO_EDGE,o.LINEAR_MIPMAP_NEAREST),i.extTextureFilterAnisotropic&&o.texParameterf(o.TEXTURE_2D,i.extTextureFilterAnisotropic.TEXTURE_MAX_ANISOTROPY_EXT,i.extTextureFilterAnisotropicMax)),t.state="loaded",e(null);}}),this.map._refreshExpiredTiles);}abortTile(t,e){t.request&&(t.request.cancel(),delete t.request),e();}unloadTile(t,e){t.texture&&this.map.painter.saveTileTexture(t.texture),e();}hasTransition(){return !1}}class B extends F{constructor(e,i,s,a){super(e,i,s,a),this.type="raster-dem",this.maxzoom=22,this._options=t.extend({type:"raster-dem"},i),this.encoding=i.encoding||"mapbox";}loadTile(e,i){const s=e.tileID.canonical.url(this.tiles,this.map.getPixelRatio(),this.scheme);function a(t,s){t&&(e.state="errored",i(t)),s&&(e.dem=s,e.needsHillshadePrepare=!0,e.needsTerrainPrepare=!0,e.state="loaded",i(null));}e.request=c.getImage(this.map._requestManager.transformRequest(s,h.Tile),function(s,o){if(delete e.request,e.aborted)e.state="unloaded",i(null);else if(s)e.state="errored",i(s);else if(o){this.map._refreshExpiredTiles&&e.setExpiryData(o),delete o.cacheControl,delete o.expires;const i=t.isImageBitmap(o)&&(null==P&&(P="undefined"!=typeof OffscreenCanvas&&new OffscreenCanvas(1,1).getContext("2d")&&"function"==typeof createImageBitmap),P)?o:t.browser.getImageData(o,1),s={uid:e.uid,coord:e.tileID,source:this.id,rawImageData:i,encoding:this.encoding};e.actor&&"expired"!==e.state||(e.actor=this.dispatcher.getActor(),e.actor.send("loadDEMTile",s,a.bind(this)));}}.bind(this),this.map._refreshExpiredTiles),e.neighboringTiles=this._getNeighboringTiles(e.tileID);}_getNeighboringTiles(e){const i=e.canonical,s=Math.pow(2,i.z),a=(i.x-1+s)%s,o=0===i.x?e.wrap-1:e.wrap,r=(i.x+1+s)%s,n=i.x+1===s?e.wrap+1:e.wrap,l={};return l[new t.OverscaledTileID(e.overscaledZ,o,i.z,a,i.y).key]={backfilled:!1},l[new t.OverscaledTileID(e.overscaledZ,n,i.z,r,i.y).key]={backfilled:!1},i.y>0&&(l[new t.OverscaledTileID(e.overscaledZ,o,i.z,a,i.y-1).key]={backfilled:!1},l[new t.OverscaledTileID(e.overscaledZ,e.wrap,i.z,i.x,i.y-1).key]={backfilled:!1},l[new t.OverscaledTileID(e.overscaledZ,n,i.z,r,i.y-1).key]={backfilled:!1}),i.y+1<s&&(l[new t.OverscaledTileID(e.overscaledZ,o,i.z,a,i.y+1).key]={backfilled:!1},l[new t.OverscaledTileID(e.overscaledZ,e.wrap,i.z,i.x,i.y+1).key]={backfilled:!1},l[new t.OverscaledTileID(e.overscaledZ,n,i.z,r,i.y+1).key]={backfilled:!1}),l}unloadTile(t){t.demTexture&&this.map.painter.saveTileTexture(t.demTexture),t.fbo&&(t.fbo.destroy(),delete t.fbo),t.dem&&delete t.dem,delete t.neighboringTiles,t.state="unloaded",t.actor&&t.actor.send("removeDEMTile",{uid:t.uid,source:this.id});}}class U extends t.Evented{constructor(e,i,s,a){super(),this.load=()=>{this._updateWorkerData();},this.serialize=()=>t.extend({},this._options,{type:this.type,data:this._data}),this.id=e,this.type="geojson",this.minzoom=0,this.maxzoom=18,this.tileSize=512,this.isTileClipped=!0,this.reparseOverscaled=!0,this._removed=!1,this._pendingLoads=0,this.actor=s.getActor(),this.setEventedParent(a),this._data=i.data,this._options=t.extend({},i),this._collectResourceTiming=i.collectResourceTiming,void 0!==i.maxzoom&&(this.maxzoom=i.maxzoom),i.type&&(this.type=i.type),i.attribution&&(this.attribution=i.attribution),this.promoteId=i.promoteId;const o=t.EXTENT/this.tileSize;this.workerOptions=t.extend({source:this.id,cluster:i.cluster||!1,geojsonVtOptions:{buffer:(void 0!==i.buffer?i.buffer:128)*o,tolerance:(void 0!==i.tolerance?i.tolerance:.375)*o,extent:t.EXTENT,maxZoom:this.maxzoom,lineMetrics:i.lineMetrics||!1,generateId:i.generateId||!1},superclusterOptions:{maxZoom:void 0!==i.clusterMaxZoom?i.clusterMaxZoom:this.maxzoom-1,minPoints:Math.max(2,i.clusterMinPoints||2),extent:t.EXTENT,radius:(i.clusterRadius||50)*o,log:!1,generateId:i.generateId||!1},clusterProperties:i.clusterProperties,filter:i.filter},i.workerOptions),"string"==typeof this.promoteId&&(this.workerOptions.promoteId=this.promoteId);}onAdd(t){this.map=t,this.load();}setData(t){return this._data=t,this._updateWorkerData(),this}updateData(t){return this._updateWorkerData(t),this}setClusterOptions(t){return this.workerOptions.cluster=t.cluster,t&&(void 0!==t.clusterRadius&&(this.workerOptions.superclusterOptions.radius=t.clusterRadius),void 0!==t.clusterMaxZoom&&(this.workerOptions.superclusterOptions.maxZoom=t.clusterMaxZoom)),this._updateWorkerData(),this}getClusterExpansionZoom(t,e){return this.actor.send("geojson.getClusterExpansionZoom",{clusterId:t,source:this.id},e),this}getClusterChildren(t,e){return this.actor.send("geojson.getClusterChildren",{clusterId:t,source:this.id},e),this}getClusterLeaves(t,e,i,s){return this.actor.send("geojson.getClusterLeaves",{source:this.id,clusterId:t,limit:e,offset:i},s),this}_updateWorkerData(e){const i=t.extend({},this.workerOptions);e?i.dataDiff=e:"string"==typeof this._data?(i.request=this.map._requestManager.transformRequest(t.browser.resolveURL(this._data),h.Source),i.request.collectResourceTiming=this._collectResourceTiming):i.data=JSON.stringify(this._data),this._pendingLoads++,this.fire(new t.Event("dataloading",{dataType:"source"})),this.actor.send(`${this.type}.loadData`,i,((e,i)=>{if(this._pendingLoads--,this._removed||i&&i.abandoned)return void this.fire(new t.Event("dataabort",{dataType:"source"}));let s=null;if(i&&i.resourceTiming&&i.resourceTiming[this.id]&&(s=i.resourceTiming[this.id].slice(0)),e)return void this.fire(new t.ErrorEvent(e));const a={dataType:"source"};this._collectResourceTiming&&s&&s.length>0&&t.extend(a,{resourceTiming:s}),this.fire(new t.Event("data",{...a,sourceDataType:"metadata"})),this.fire(new t.Event("data",{...a,sourceDataType:"content"}));}));}loaded(){return 0===this._pendingLoads}loadTile(t,e){const i=t.actor?"reloadTile":"loadTile";t.actor=this.actor;const s={type:this.type,uid:t.uid,tileID:t.tileID,zoom:t.tileID.overscaledZ,maxZoom:this.maxzoom,tileSize:this.tileSize,source:this.id,pixelRatio:this.map.getPixelRatio(),showCollisionBoxes:this.map.showCollisionBoxes,promoteId:this.promoteId};t.request=this.actor.send(i,s,((s,a)=>(delete t.request,t.unloadVectorData(),t.aborted?e(null):s?e(s):(t.loadVectorData(a,this.map.painter,"reloadTile"===i),e(null)))));}abortTile(t){t.request&&(t.request.cancel(),delete t.request),t.aborted=!0;}unloadTile(t){t.unloadVectorData(),this.actor.send("removeTile",{uid:t.uid,type:this.type,source:this.id});}onRemove(){this._removed=!0,this.actor.send("removeSource",{type:this.type,source:this.id});}hasTransition(){return !1}}var O=t.createLayout([{name:"a_pos",type:"Int16",components:2},{name:"a_texture_pos",type:"Int16",components:2}]);class N extends t.Evented{constructor(e,i,s,a){super(),this.load=(e,i)=>{this._loaded=!1,this.fire(new t.Event("dataloading",{dataType:"source"})),this.url=this.options.url,this._request=c.getImage(this.map._requestManager.transformRequest(this.url,h.Image),((s,a)=>{this._request=null,this._loaded=!0,s?this.fire(new t.ErrorEvent(s)):a&&(this.image=a,e&&(this.coordinates=e),i&&i(),this._finishLoading());}));},this.prepare=()=>{if(0===Object.keys(this.tiles).length||!this.image)return;const e=this.map.painter.context,i=e.gl;this.boundsBuffer||(this.boundsBuffer=e.createVertexBuffer(this._boundsArray,O.members)),this.boundsSegments||(this.boundsSegments=t.SegmentVector.simpleSegment(0,0,4,2)),this.texture||(this.texture=new x(e,this.image,i.RGBA),this.texture.bind(i.LINEAR,i.CLAMP_TO_EDGE));let s=!1;for(const t in this.tiles){const e=this.tiles[t];"loaded"!==e.state&&(e.state="loaded",e.texture=this.texture,s=!0);}s&&this.fire(new t.Event("data",{dataType:"source",sourceDataType:"idle",sourceId:this.id}));},this.serialize=()=>({type:"image",url:this.options.url,coordinates:this.coordinates}),this.id=e,this.dispatcher=s,this.coordinates=i.coordinates,this.type="image",this.minzoom=0,this.maxzoom=22,this.tileSize=512,this.tiles={},this._loaded=!1,this.setEventedParent(a),this.options=i;}loaded(){return this._loaded}updateImage(t){return t.url?(this._request&&(this._request.cancel(),this._request=null),this.options.url=t.url,this.load(t.coordinates,(()=>{this.texture=null;})),this):this}_finishLoading(){this.map&&(this.setCoordinates(this.coordinates),this.fire(new t.Event("data",{dataType:"source",sourceDataType:"metadata"})));}onAdd(t){this.map=t,this.load();}onRemove(){this._request&&(this._request.cancel(),this._request=null);}setCoordinates(e){this.coordinates=e;const i=e.map(t.MercatorCoordinate.fromLngLat);this.tileID=function(e){let i=1/0,s=1/0,a=-1/0,o=-1/0;for(const t of e)i=Math.min(i,t.x),s=Math.min(s,t.y),a=Math.max(a,t.x),o=Math.max(o,t.y);const r=Math.max(a-i,o-s),n=Math.max(0,Math.floor(-Math.log(r)/Math.LN2)),l=Math.pow(2,n);return new t.CanonicalTileID(n,Math.floor((i+a)/2*l),Math.floor((s+o)/2*l))}(i),this.minzoom=this.maxzoom=this.tileID.z;const s=i.map((t=>this.tileID.getTilePoint(t)._round()));return this._boundsArray=new t.RasterBoundsArray,this._boundsArray.emplaceBack(s[0].x,s[0].y,0,0),this._boundsArray.emplaceBack(s[1].x,s[1].y,t.EXTENT,0),this._boundsArray.emplaceBack(s[3].x,s[3].y,0,t.EXTENT),this._boundsArray.emplaceBack(s[2].x,s[2].y,t.EXTENT,t.EXTENT),this.boundsBuffer&&(this.boundsBuffer.destroy(),delete this.boundsBuffer),this.fire(new t.Event("data",{dataType:"source",sourceDataType:"content"})),this}loadTile(t,e){this.tileID&&this.tileID.equals(t.tileID.canonical)?(this.tiles[String(t.tileID.wrap)]=t,t.buckets={},e(null)):(t.state="errored",e(null));}hasTransition(){return !1}}class Z extends N{constructor(e,i,s,a){super(e,i,s,a),this.load=()=>{this._loaded=!1;const e=this.options;this.urls=[];for(const t of e.urls)this.urls.push(this.map._requestManager.transformRequest(t,h.Source).url);t.getVideo(this.urls,((e,i)=>{this._loaded=!0,e?this.fire(new t.ErrorEvent(e)):i&&(this.video=i,this.video.loop=!0,this.video.addEventListener("playing",(()=>{this.map.triggerRepaint();})),this.map&&this.video.play(),this._finishLoading());}));},this.prepare=()=>{if(0===Object.keys(this.tiles).length||this.video.readyState<2)return;const e=this.map.painter.context,i=e.gl;this.boundsBuffer||(this.boundsBuffer=e.createVertexBuffer(this._boundsArray,O.members)),this.boundsSegments||(this.boundsSegments=t.SegmentVector.simpleSegment(0,0,4,2)),this.texture?this.video.paused||(this.texture.bind(i.LINEAR,i.CLAMP_TO_EDGE),i.texSubImage2D(i.TEXTURE_2D,0,0,0,i.RGBA,i.UNSIGNED_BYTE,this.video)):(this.texture=new x(e,this.video,i.RGBA),this.texture.bind(i.LINEAR,i.CLAMP_TO_EDGE));let s=!1;for(const t in this.tiles){const e=this.tiles[t];"loaded"!==e.state&&(e.state="loaded",e.texture=this.texture,s=!0);}s&&this.fire(new t.Event("data",{dataType:"source",sourceDataType:"idle",sourceId:this.id}));},this.serialize=()=>({type:"video",urls:this.urls,coordinates:this.coordinates}),this.roundZoom=!0,this.type="video",this.options=i;}pause(){this.video&&this.video.pause();}play(){this.video&&this.video.play();}seek(e){if(this.video){const i=this.video.seekable;e<i.start(0)||e>i.end(0)?this.fire(new t.ErrorEvent(new t.ValidationError(`sources.${this.id}`,null,`Playback for this video can be set only between the ${i.start(0)} and ${i.end(0)}-second mark.`))):this.video.currentTime=e;}}getVideo(){return this.video}onAdd(t){this.map||(this.map=t,this.load(),this.video&&(this.video.play(),this.setCoordinates(this.coordinates)));}hasTransition(){return this.video&&!this.video.paused}}class G extends N{constructor(e,i,s,a){super(e,i,s,a),this.load=()=>{this._loaded=!0,this.canvas||(this.canvas=this.options.canvas instanceof HTMLCanvasElement?this.options.canvas:document.getElementById(this.options.canvas)),this.width=this.canvas.width,this.height=this.canvas.height,this._hasInvalidDimensions()?this.fire(new t.ErrorEvent(new Error("Canvas dimensions cannot be less than or equal to zero."))):(this.play=function(){this._playing=!0,this.map.triggerRepaint();},this.pause=function(){this._playing&&(this.prepare(),this._playing=!1);},this._finishLoading());},this.prepare=()=>{let e=!1;if(this.canvas.width!==this.width&&(this.width=this.canvas.width,e=!0),this.canvas.height!==this.height&&(this.height=this.canvas.height,e=!0),this._hasInvalidDimensions())return;if(0===Object.keys(this.tiles).length)return;const i=this.map.painter.context,s=i.gl;this.boundsBuffer||(this.boundsBuffer=i.createVertexBuffer(this._boundsArray,O.members)),this.boundsSegments||(this.boundsSegments=t.SegmentVector.simpleSegment(0,0,4,2)),this.texture?(e||this._playing)&&this.texture.update(this.canvas,{premultiply:!0}):this.texture=new x(i,this.canvas,s.RGBA,{premultiply:!0});let a=!1;for(const t in this.tiles){const e=this.tiles[t];"loaded"!==e.state&&(e.state="loaded",e.texture=this.texture,a=!0);}a&&this.fire(new t.Event("data",{dataType:"source",sourceDataType:"idle",sourceId:this.id}));},this.serialize=()=>({type:"canvas",coordinates:this.coordinates}),i.coordinates?Array.isArray(i.coordinates)&&4===i.coordinates.length&&!i.coordinates.some((t=>!Array.isArray(t)||2!==t.length||t.some((t=>"number"!=typeof t))))||this.fire(new t.ErrorEvent(new t.ValidationError(`sources.${e}`,null,'"coordinates" property must be an array of 4 longitude/latitude array pairs'))):this.fire(new t.ErrorEvent(new t.ValidationError(`sources.${e}`,null,'missing required property "coordinates"'))),i.animate&&"boolean"!=typeof i.animate&&this.fire(new t.ErrorEvent(new t.ValidationError(`sources.${e}`,null,'optional "animate" property must be a boolean value'))),i.canvas?"string"==typeof i.canvas||i.canvas instanceof HTMLCanvasElement||this.fire(new t.ErrorEvent(new t.ValidationError(`sources.${e}`,null,'"canvas" must be either a string representing the ID of the canvas element from which to read, or an HTMLCanvasElement instance'))):this.fire(new t.ErrorEvent(new t.ValidationError(`sources.${e}`,null,'missing required property "canvas"'))),this.options=i,this.animate=void 0===i.animate||i.animate;}getCanvas(){return this.canvas}onAdd(t){this.map=t,this.load(),this.canvas&&this.animate&&this.play();}onRemove(){this.pause();}hasTransition(){return this._playing}_hasInvalidDimensions(){for(const t of [this.canvas.width,this.canvas.height])if(isNaN(t)||t<=0)return !0;return !1}}const V={},q=t=>{switch(t){case"geojson":return U;case"image":return N;case"raster":return F;case"raster-dem":return B;case"vector":return k;case"video":return Z;case"canvas":return G}return V[t]};function j(e,i){const s=t.create();return t.translate(s,s,[1,1,0]),t.scale(s,s,[.5*e.width,.5*e.height,1]),t.multiply(s,s,e.calculatePosMatrix(i.toUnwrapped()))}function $(t,e,i,s,a,o){const r=function(t,e,i){if(t)for(const s of t){const t=e[s];if(t&&t.source===i&&"fill-extrusion"===t.type)return !0}else for(const t in e){const s=e[t];if(s.source===i&&"fill-extrusion"===s.type)return !0}return !1}(a&&a.layers,e,t.id),n=o.maxPitchScaleFactor(),l=t.tilesIn(s,n,r);l.sort(X);const c=[];for(const s of l)c.push({wrappedTileID:s.tileID.wrapped().key,queryResults:s.tile.queryRenderedFeatures(e,i,t._state,s.queryGeometry,s.cameraQueryGeometry,s.scale,a,o,n,j(t.transform,s.tileID))});const h=function(t){const e={},i={};for(const s of t){const t=s.queryResults,a=s.wrappedTileID,o=i[a]=i[a]||{};for(const i in t){const s=t[i],a=o[i]=o[i]||{},r=e[i]=e[i]||[];for(const t of s)a[t.featureIndex]||(a[t.featureIndex]=!0,r.push(t));}}return e}(c);for(const e in h)h[e].forEach((e=>{const i=e.feature,s=t.getFeatureState(i.layer["source-layer"],i.id);i.source=i.layer.source,i.layer["source-layer"]&&(i.sourceLayer=i.layer["source-layer"]),i.state=s;}));return h}function X(t,e){const i=t.tileID,s=e.tileID;return i.overscaledZ-s.overscaledZ||i.canonical.y-s.canonical.y||i.wrap-s.wrap||i.canonical.x-s.canonical.x}class W{constructor(e,i){this.timeAdded=0,this.fadeEndTime=0,this.tileID=e,this.uid=t.uniqueId(),this.uses=0,this.tileSize=i,this.buckets={},this.expirationTime=null,this.queryPadding=0,this.hasSymbolBuckets=!1,this.hasRTLText=!1,this.dependencies={},this.rtt=[],this.rttCoords={},this.expiredRequestCount=0,this.state="loading";}registerFadeDuration(t){const e=t+this.timeAdded;e<this.fadeEndTime||(this.fadeEndTime=e);}wasRequested(){return "errored"===this.state||"loaded"===this.state||"reloading"===this.state}clearTextures(t){this.demTexture&&t.saveTileTexture(this.demTexture),this.demTexture=null;}loadVectorData(e,i,s){if(this.hasData()&&this.unloadVectorData(),this.state="loaded",e){e.featureIndex&&(this.latestFeatureIndex=e.featureIndex,e.rawTileData?(this.latestRawTileData=e.rawTileData,this.latestFeatureIndex.rawTileData=e.rawTileData):this.latestRawTileData&&(this.latestFeatureIndex.rawTileData=this.latestRawTileData)),this.collisionBoxArray=e.collisionBoxArray,this.buckets=function(t,e){const i={};if(!e)return i;for(const s of t){const t=s.layerIds.map((t=>e.getLayer(t))).filter(Boolean);if(0!==t.length){s.layers=t,s.stateDependentLayerIds&&(s.stateDependentLayers=s.stateDependentLayerIds.map((e=>t.filter((t=>t.id===e))[0])));for(const e of t)i[e.id]=s;}}return i}(e.buckets,i.style),this.hasSymbolBuckets=!1;for(const e in this.buckets){const i=this.buckets[e];if(i instanceof t.SymbolBucket){if(this.hasSymbolBuckets=!0,!s)break;i.justReloaded=!0;}}if(this.hasRTLText=!1,this.hasSymbolBuckets)for(const e in this.buckets){const i=this.buckets[e];if(i instanceof t.SymbolBucket&&i.hasRTLText){this.hasRTLText=!0,t.lazyLoadRTLTextPlugin();break}}this.queryPadding=0;for(const t in this.buckets){const e=this.buckets[t];this.queryPadding=Math.max(this.queryPadding,i.style.getLayer(t).queryRadius(e));}e.imageAtlas&&(this.imageAtlas=e.imageAtlas),e.glyphAtlasImage&&(this.glyphAtlasImage=e.glyphAtlasImage);}else this.collisionBoxArray=new t.CollisionBoxArray;}unloadVectorData(){for(const t in this.buckets)this.buckets[t].destroy();this.buckets={},this.imageAtlasTexture&&this.imageAtlasTexture.destroy(),this.imageAtlas&&(this.imageAtlas=null),this.glyphAtlasTexture&&this.glyphAtlasTexture.destroy(),this.latestFeatureIndex=null,this.state="unloaded";}getBucket(t){return this.buckets[t.id]}upload(t){for(const e in this.buckets){const i=this.buckets[e];i.uploadPending()&&i.upload(t);}const e=t.gl;this.imageAtlas&&!this.imageAtlas.uploaded&&(this.imageAtlasTexture=new x(t,this.imageAtlas.image,e.RGBA),this.imageAtlas.uploaded=!0),this.glyphAtlasImage&&(this.glyphAtlasTexture=new x(t,this.glyphAtlasImage,e.ALPHA),this.glyphAtlasImage=null);}prepare(t){this.imageAtlas&&this.imageAtlas.patchUpdatedImages(t,this.imageAtlasTexture);}queryRenderedFeatures(t,e,i,s,a,o,r,n,l,c){return this.latestFeatureIndex&&this.latestFeatureIndex.rawTileData?this.latestFeatureIndex.query({queryGeometry:s,cameraQueryGeometry:a,scale:o,tileSize:this.tileSize,pixelPosMatrix:c,transform:n,params:r,queryPadding:this.queryPadding*l},t,e,i):{}}querySourceFeatures(e,i){const s=this.latestFeatureIndex;if(!s||!s.rawTileData)return;const a=s.loadVTLayers(),o=i&&i.sourceLayer?i.sourceLayer:"",r=a._geojsonTileLayer||a[o];if(!r)return;const n=t.createFilter(i&&i.filter),{z:l,x:c,y:h}=this.tileID.canonical,u={z:l,x:c,y:h};for(let i=0;i<r.length;i++){const a=r.feature(i);if(n.needGeometry){const e=t.toEvaluationFeature(a,!0);if(!n.filter(new t.EvaluationParameters(this.tileID.overscaledZ),e,this.tileID.canonical))continue}else if(!n.filter(new t.EvaluationParameters(this.tileID.overscaledZ),a))continue;const d=s.getId(a,o),_=new t.GeoJSONFeature(a,l,c,h,d);_.tile=u,e.push(_);}}hasData(){return "loaded"===this.state||"reloading"===this.state||"expired"===this.state}patternsLoaded(){return this.imageAtlas&&!!Object.keys(this.imageAtlas.patternPositions).length}setExpiryData(e){const i=this.expirationTime;if(e.cacheControl){const i=t.parseCacheControl(e.cacheControl);i["max-age"]&&(this.expirationTime=Date.now()+1e3*i["max-age"]);}else e.expires&&(this.expirationTime=new Date(e.expires).getTime());if(this.expirationTime){const t=Date.now();let e=!1;if(this.expirationTime>t)e=!1;else if(i)if(this.expirationTime<i)e=!0;else {const s=this.expirationTime-i;s?this.expirationTime=t+Math.max(s,3e4):e=!0;}else e=!0;e?(this.expiredRequestCount++,this.state="expired"):this.expiredRequestCount=0;}}getExpiryTimeout(){if(this.expirationTime)return this.expiredRequestCount?1e3*(1<<Math.min(this.expiredRequestCount-1,31)):Math.min(this.expirationTime-(new Date).getTime(),Math.pow(2,31)-1)}setFeatureState(t,e){if(!this.latestFeatureIndex||!this.latestFeatureIndex.rawTileData||0===Object.keys(t).length)return;const i=this.latestFeatureIndex.loadVTLayers();for(const s in this.buckets){if(!e.style.hasLayer(s))continue;const a=this.buckets[s],o=a.layers[0].sourceLayer||"_geojsonTileLayer",r=i[o],n=t[o];if(!r||!n||0===Object.keys(n).length)continue;a.update(n,r,this.imageAtlas&&this.imageAtlas.patternPositions||{});const l=e&&e.style&&e.style.getLayer(s);l&&(this.queryPadding=Math.max(this.queryPadding,l.queryRadius(a)));}}holdingForFade(){return void 0!==this.symbolFadeHoldUntil}symbolFadeFinished(){return !this.symbolFadeHoldUntil||this.symbolFadeHoldUntil<t.browser.now()}clearFadeHold(){this.symbolFadeHoldUntil=void 0;}setHoldDuration(e){this.symbolFadeHoldUntil=t.browser.now()+e;}setDependencies(t,e){const i={};for(const t of e)i[t]=!0;this.dependencies[t]=i;}hasDependency(t,e){for(const i of t){const t=this.dependencies[i];if(t)for(const i of e)if(t[i])return !0}return !1}}class H{constructor(t,e){this.max=t,this.onRemove=e,this.reset();}reset(){for(const t in this.data)for(const e of this.data[t])e.timeout&&clearTimeout(e.timeout),this.onRemove(e.value);return this.data={},this.order=[],this}add(t,e,i){const s=t.wrapped().key;void 0===this.data[s]&&(this.data[s]=[]);const a={value:e,timeout:void 0};if(void 0!==i&&(a.timeout=setTimeout((()=>{this.remove(t,a);}),i)),this.data[s].push(a),this.order.push(s),this.order.length>this.max){const t=this._getAndRemoveByKey(this.order[0]);t&&this.onRemove(t);}return this}has(t){return t.wrapped().key in this.data}getAndRemove(t){return this.has(t)?this._getAndRemoveByKey(t.wrapped().key):null}_getAndRemoveByKey(t){const e=this.data[t].shift();return e.timeout&&clearTimeout(e.timeout),0===this.data[t].length&&delete this.data[t],this.order.splice(this.order.indexOf(t),1),e.value}getByKey(t){const e=this.data[t];return e?e[0].value:null}get(t){return this.has(t)?this.data[t.wrapped().key][0].value:null}remove(t,e){if(!this.has(t))return this;const i=t.wrapped().key,s=void 0===e?0:this.data[i].indexOf(e),a=this.data[i][s];return this.data[i].splice(s,1),a.timeout&&clearTimeout(a.timeout),0===this.data[i].length&&delete this.data[i],this.onRemove(a.value),this.order.splice(this.order.indexOf(i),1),this}setMaxSize(t){for(this.max=t;this.order.length>this.max;){const t=this._getAndRemoveByKey(this.order[0]);t&&this.onRemove(t);}return this}filter(t){const e=[];for(const i in this.data)for(const s of this.data[i])t(s.value)||e.push(s);for(const t of e)this.remove(t.value.tileID,t);}}class K{constructor(){this.state={},this.stateChanges={},this.deletedStates={};}updateState(e,i,s){const a=String(i);if(this.stateChanges[e]=this.stateChanges[e]||{},this.stateChanges[e][a]=this.stateChanges[e][a]||{},t.extend(this.stateChanges[e][a],s),null===this.deletedStates[e]){this.deletedStates[e]={};for(const t in this.state[e])t!==a&&(this.deletedStates[e][t]=null);}else if(this.deletedStates[e]&&null===this.deletedStates[e][a]){this.deletedStates[e][a]={};for(const t in this.state[e][a])s[t]||(this.deletedStates[e][a][t]=null);}else for(const t in s)this.deletedStates[e]&&this.deletedStates[e][a]&&null===this.deletedStates[e][a][t]&&delete this.deletedStates[e][a][t];}removeFeatureState(t,e,i){if(null===this.deletedStates[t])return;const s=String(e);if(this.deletedStates[t]=this.deletedStates[t]||{},i&&void 0!==e)null!==this.deletedStates[t][s]&&(this.deletedStates[t][s]=this.deletedStates[t][s]||{},this.deletedStates[t][s][i]=null);else if(void 0!==e)if(this.stateChanges[t]&&this.stateChanges[t][s])for(i in this.deletedStates[t][s]={},this.stateChanges[t][s])this.deletedStates[t][s][i]=null;else this.deletedStates[t][s]=null;else this.deletedStates[t]=null;}getState(e,i){const s=String(i),a=t.extend({},(this.state[e]||{})[s],(this.stateChanges[e]||{})[s]);if(null===this.deletedStates[e])return {};if(this.deletedStates[e]){const t=this.deletedStates[e][i];if(null===t)return {};for(const e in t)delete a[e];}return a}initializeTileState(t,e){t.setFeatureState(this.state,e);}coalesceChanges(e,i){const s={};for(const e in this.stateChanges){this.state[e]=this.state[e]||{};const i={};for(const s in this.stateChanges[e])this.state[e][s]||(this.state[e][s]={}),t.extend(this.state[e][s],this.stateChanges[e][s]),i[s]=this.state[e][s];s[e]=i;}for(const e in this.deletedStates){this.state[e]=this.state[e]||{};const i={};if(null===this.deletedStates[e])for(const t in this.state[e])i[t]={},this.state[e][t]={};else for(const t in this.deletedStates[e]){if(null===this.deletedStates[e][t])this.state[e][t]={};else for(const i of Object.keys(this.deletedStates[e][t]))delete this.state[e][t][i];i[t]=this.state[e][t];}s[e]=s[e]||{},t.extend(s[e],i);}if(this.stateChanges={},this.deletedStates={},0!==Object.keys(s).length)for(const t in e)e[t].setFeatureState(s,i);}}class Y extends t.Evented{constructor(t,e,i){super(),this.id=t,this.dispatcher=i,this.on("data",(t=>{"source"===t.dataType&&"metadata"===t.sourceDataType&&(this._sourceLoaded=!0),this._sourceLoaded&&!this._paused&&"source"===t.dataType&&"content"===t.sourceDataType&&(this.reload(),this.transform&&this.update(this.transform,this.terrain),this._didEmitContent=!0);})),this.on("dataloading",(()=>{this._sourceErrored=!1;})),this.on("error",(()=>{this._sourceErrored=this._source.loaded();})),this._source=((t,e,i,s)=>{const a=new(q(e.type))(t,e,i,s);if(a.id!==t)throw new Error(`Expected Source id to be ${t} instead of ${a.id}`);return a})(t,e,i,this),this._tiles={},this._cache=new H(0,this._unloadTile.bind(this)),this._timers={},this._cacheTimers={},this._maxTileCacheSize=null,this._maxTileCacheZoomLevels=null,this._loadedParentTiles={},this._coveredTiles={},this._state=new K,this._didEmitContent=!1,this._updated=!1;}onAdd(t){this.map=t,this._maxTileCacheSize=t?t._maxTileCacheSize:null,this._maxTileCacheZoomLevels=t?t._maxTileCacheZoomLevels:null,this._source&&this._source.onAdd&&this._source.onAdd(t);}onRemove(t){this.clearTiles(),this._source&&this._source.onRemove&&this._source.onRemove(t);}loaded(){if(this._sourceErrored)return !0;if(!this._sourceLoaded)return !1;if(!this._source.loaded())return !1;if(!(void 0===this.used&&void 0===this.usedForTerrain||this.used||this.usedForTerrain))return !0;if(!this._updated)return !1;for(const t in this._tiles){const e=this._tiles[t];if("loaded"!==e.state&&"errored"!==e.state)return !1}return !0}getSource(){return this._source}pause(){this._paused=!0;}resume(){if(!this._paused)return;const t=this._shouldReloadOnResume;this._paused=!1,this._shouldReloadOnResume=!1,t&&this.reload(),this.transform&&this.update(this.transform,this.terrain);}_loadTile(t,e){return this._source.loadTile(t,e)}_unloadTile(t){if(this._source.unloadTile)return this._source.unloadTile(t,(()=>{}))}_abortTile(e){this._source.abortTile&&this._source.abortTile(e,(()=>{})),this._source.fire(new t.Event("dataabort",{tile:e,coord:e.tileID,dataType:"source"}));}serialize(){return this._source.serialize()}prepare(t){this._source.prepare&&this._source.prepare(),this._state.coalesceChanges(this._tiles,this.map?this.map.painter:null);for(const e in this._tiles){const i=this._tiles[e];i.upload(t),i.prepare(this.map.style.imageManager);}}getIds(){return Object.values(this._tiles).map((t=>t.tileID)).sort(J).map((t=>t.key))}getRenderableIds(e){const i=[];for(const t in this._tiles)this._isIdRenderable(t,e)&&i.push(this._tiles[t]);return e?i.sort(((e,i)=>{const s=e.tileID,a=i.tileID,o=new t.Point(s.canonical.x,s.canonical.y)._rotate(this.transform.angle),r=new t.Point(a.canonical.x,a.canonical.y)._rotate(this.transform.angle);return s.overscaledZ-a.overscaledZ||r.y-o.y||r.x-o.x})).map((t=>t.tileID.key)):i.map((t=>t.tileID)).sort(J).map((t=>t.key))}hasRenderableParent(t){const e=this.findLoadedParent(t,0);return !!e&&this._isIdRenderable(e.tileID.key)}_isIdRenderable(t,e){return this._tiles[t]&&this._tiles[t].hasData()&&!this._coveredTiles[t]&&(e||!this._tiles[t].holdingForFade())}reload(){if(this._paused)this._shouldReloadOnResume=!0;else {this._cache.reset();for(const t in this._tiles)"errored"!==this._tiles[t].state&&this._reloadTile(t,"reloading");}}_reloadTile(t,e){const i=this._tiles[t];i&&("loading"!==i.state&&(i.state=e),this._loadTile(i,this._tileLoaded.bind(this,i,t,e)));}_tileLoaded(e,i,s,a){if(a)return e.state="errored",void(404!==a.status?this._source.fire(new t.ErrorEvent(a,{tile:e})):this.update(this.transform,this.terrain));e.timeAdded=t.browser.now(),"expired"===s&&(e.refreshedUponExpiration=!0),this._setTileReloadTimer(i,e),"raster-dem"===this.getSource().type&&e.dem&&this._backfillDEM(e),this._state.initializeTileState(e,this.map?this.map.painter:null),e.aborted||this._source.fire(new t.Event("data",{dataType:"source",tile:e,coord:e.tileID}));}_backfillDEM(t){const e=this.getRenderableIds();for(let s=0;s<e.length;s++){const a=e[s];if(t.neighboringTiles&&t.neighboringTiles[a]){const e=this.getTileByID(a);i(t,e),i(e,t);}}function i(t,e){t.needsHillshadePrepare=!0,t.needsTerrainPrepare=!0;let i=e.tileID.canonical.x-t.tileID.canonical.x;const s=e.tileID.canonical.y-t.tileID.canonical.y,a=Math.pow(2,t.tileID.canonical.z),o=e.tileID.key;0===i&&0===s||Math.abs(s)>1||(Math.abs(i)>1&&(1===Math.abs(i+a)?i+=a:1===Math.abs(i-a)&&(i-=a)),e.dem&&t.dem&&(t.dem.backfillBorder(e.dem,i,s),t.neighboringTiles&&t.neighboringTiles[o]&&(t.neighboringTiles[o].backfilled=!0)));}}getTile(t){return this.getTileByID(t.key)}getTileByID(t){return this._tiles[t]}_retainLoadedChildren(t,e,i,s){for(const a in this._tiles){let o=this._tiles[a];if(s[a]||!o.hasData()||o.tileID.overscaledZ<=e||o.tileID.overscaledZ>i)continue;let r=o.tileID;for(;o&&o.tileID.overscaledZ>e+1;){const t=o.tileID.scaledTo(o.tileID.overscaledZ-1);o=this._tiles[t.key],o&&o.hasData()&&(r=t);}let n=r;for(;n.overscaledZ>e;)if(n=n.scaledTo(n.overscaledZ-1),t[n.key]){s[r.key]=r;break}}}findLoadedParent(t,e){if(t.key in this._loadedParentTiles){const i=this._loadedParentTiles[t.key];return i&&i.tileID.overscaledZ>=e?i:null}for(let i=t.overscaledZ-1;i>=e;i--){const e=t.scaledTo(i),s=this._getLoadedTile(e);if(s)return s}}_getLoadedTile(t){const e=this._tiles[t.key];return e&&e.hasData()?e:this._cache.getByKey(t.wrapped().key)}updateCacheSize(e){const i=Math.ceil(e.width/this._source.tileSize)+1,s=Math.ceil(e.height/this._source.tileSize)+1,a=Math.floor(i*s*(null===this._maxTileCacheZoomLevels?t.config.MAX_TILE_CACHE_ZOOM_LEVELS:this._maxTileCacheZoomLevels)),o="number"==typeof this._maxTileCacheSize?Math.min(this._maxTileCacheSize,a):a;this._cache.setMaxSize(o);}handleWrapJump(t){const e=Math.round((t-(void 0===this._prevLng?t:this._prevLng))/360);if(this._prevLng=t,e){const t={};for(const i in this._tiles){const s=this._tiles[i];s.tileID=s.tileID.unwrapTo(s.tileID.wrap+e),t[s.tileID.key]=s;}this._tiles=t;for(const t in this._timers)clearTimeout(this._timers[t]),delete this._timers[t];for(const t in this._tiles)this._setTileReloadTimer(t,this._tiles[t]);}}update(e,i){if(this.transform=e,this.terrain=i,!this._sourceLoaded||this._paused)return;let s;this.updateCacheSize(e),this.handleWrapJump(this.transform.center.lng),this._coveredTiles={},this.used||this.usedForTerrain?this._source.tileID?s=e.getVisibleUnwrappedCoordinates(this._source.tileID).map((e=>new t.OverscaledTileID(e.canonical.z,e.wrap,e.canonical.z,e.canonical.x,e.canonical.y))):(s=e.coveringTiles({tileSize:this.usedForTerrain?this.tileSize:this._source.tileSize,minzoom:this._source.minzoom,maxzoom:this._source.maxzoom,roundZoom:!this.usedForTerrain&&this._source.roundZoom,reparseOverscaled:this._source.reparseOverscaled,terrain:i}),this._source.hasTile&&(s=s.filter((t=>this._source.hasTile(t))))):s=[];const a=e.coveringZoomLevel(this._source),o=Math.max(a-Y.maxOverzooming,this._source.minzoom),r=Math.max(a+Y.maxUnderzooming,this._source.minzoom);if(this.usedForTerrain){const t={};for(const e of s)if(e.canonical.z>this._source.minzoom){const i=e.scaledTo(e.canonical.z-1);t[i.key]=i;const s=e.scaledTo(Math.max(this._source.minzoom,Math.min(e.canonical.z,5)));t[s.key]=s;}s=s.concat(Object.values(t));}const n=0===s.length&&!this._updated&&this._didEmitContent;this._updated=!0,n&&this.fire(new t.Event("data",{sourceDataType:"idle",dataType:"source",sourceId:this.id}));const l=this._updateRetainedTiles(s,a);if(Q(this._source.type)){const e={},n={},c=Object.keys(l),h=t.browser.now();for(const t of c){const i=l[t],s=this._tiles[t];if(!s||0!==s.fadeEndTime&&s.fadeEndTime<=h)continue;const a=this.findLoadedParent(i,o);a&&(this._addTile(a.tileID),e[a.tileID.key]=a.tileID),n[t]=i;}this._retainLoadedChildren(n,a,r,l);for(const t in e)l[t]||(this._coveredTiles[t]=!0,l[t]=e[t]);if(i){const t={},e={};for(const i of s)this._tiles[i.key].hasData()?t[i.key]=i:e[i.key]=i;for(const i in e){const s=e[i].children(this._source.maxzoom);this._tiles[s[0].key]&&this._tiles[s[1].key]&&this._tiles[s[2].key]&&this._tiles[s[3].key]&&(t[s[0].key]=l[s[0].key]=s[0],t[s[1].key]=l[s[1].key]=s[1],t[s[2].key]=l[s[2].key]=s[2],t[s[3].key]=l[s[3].key]=s[3],delete e[i]);}for(const i in e){const s=this.findLoadedParent(e[i],this._source.minzoom);if(s){t[s.tileID.key]=l[s.tileID.key]=s.tileID;for(const e in t)t[e].isChildOf(s.tileID)&&delete t[e];}}for(const e in this._tiles)t[e]||(this._coveredTiles[e]=!0);}}for(const t in l)this._tiles[t].clearFadeHold();const c=t.keysDifference(this._tiles,l);for(const t of c){const e=this._tiles[t];e.hasSymbolBuckets&&!e.holdingForFade()?e.setHoldDuration(this.map._fadeDuration):e.hasSymbolBuckets&&!e.symbolFadeFinished()||this._removeTile(t);}this._updateLoadedParentTileCache();}releaseSymbolFadeTiles(){for(const t in this._tiles)this._tiles[t].holdingForFade()&&this._removeTile(t);}_updateRetainedTiles(t,e){const i={},s={},a=Math.max(e-Y.maxOverzooming,this._source.minzoom),o=Math.max(e+Y.maxUnderzooming,this._source.minzoom),r={};for(const s of t){const t=this._addTile(s);i[s.key]=s,t.hasData()||e<this._source.maxzoom&&(r[s.key]=s);}this._retainLoadedChildren(r,e,o,i);for(const o of t){let t=this._tiles[o.key];if(t.hasData())continue;if(e+1>this._source.maxzoom){const t=o.children(this._source.maxzoom)[0],e=this.getTile(t);if(e&&e.hasData()){i[t.key]=t;continue}}else {const t=o.children(this._source.maxzoom);if(i[t[0].key]&&i[t[1].key]&&i[t[2].key]&&i[t[3].key])continue}let r=t.wasRequested();for(let e=o.overscaledZ-1;e>=a;--e){const a=o.scaledTo(e);if(s[a.key])break;if(s[a.key]=!0,t=this.getTile(a),!t&&r&&(t=this._addTile(a)),t){const e=t.hasData();if((r||e)&&(i[a.key]=a),r=t.wasRequested(),e)break}}}return i}_updateLoadedParentTileCache(){this._loadedParentTiles={};for(const t in this._tiles){const e=[];let i,s=this._tiles[t].tileID;for(;s.overscaledZ>0;){if(s.key in this._loadedParentTiles){i=this._loadedParentTiles[s.key];break}e.push(s.key);const t=s.scaledTo(s.overscaledZ-1);if(i=this._getLoadedTile(t),i)break;s=t;}for(const t of e)this._loadedParentTiles[t]=i;}}_addTile(e){let i=this._tiles[e.key];if(i)return i;i=this._cache.getAndRemove(e),i&&(this._setTileReloadTimer(e.key,i),i.tileID=e,this._state.initializeTileState(i,this.map?this.map.painter:null),this._cacheTimers[e.key]&&(clearTimeout(this._cacheTimers[e.key]),delete this._cacheTimers[e.key],this._setTileReloadTimer(e.key,i)));const s=i;return i||(i=new W(e,this._source.tileSize*e.overscaleFactor()),this._loadTile(i,this._tileLoaded.bind(this,i,e.key,i.state))),i.uses++,this._tiles[e.key]=i,s||this._source.fire(new t.Event("dataloading",{tile:i,coord:i.tileID,dataType:"source"})),i}_setTileReloadTimer(t,e){t in this._timers&&(clearTimeout(this._timers[t]),delete this._timers[t]);const i=e.getExpiryTimeout();i&&(this._timers[t]=setTimeout((()=>{this._reloadTile(t,"expired"),delete this._timers[t];}),i));}_removeTile(t){const e=this._tiles[t];e&&(e.uses--,delete this._tiles[t],this._timers[t]&&(clearTimeout(this._timers[t]),delete this._timers[t]),e.uses>0||(e.hasData()&&"reloading"!==e.state?this._cache.add(e.tileID,e,e.getExpiryTimeout()):(e.aborted=!0,this._abortTile(e),this._unloadTile(e))));}clearTiles(){this._shouldReloadOnResume=!1,this._paused=!1;for(const t in this._tiles)this._removeTile(t);this._cache.reset();}tilesIn(e,i,s){const a=[],o=this.transform;if(!o)return a;const r=s?o.getCameraQueryGeometry(e):e,n=e.map((t=>o.pointCoordinate(t,this.terrain))),l=r.map((t=>o.pointCoordinate(t,this.terrain))),c=this.getIds();let h=1/0,u=1/0,d=-1/0,_=-1/0;for(const t of l)h=Math.min(h,t.x),u=Math.min(u,t.y),d=Math.max(d,t.x),_=Math.max(_,t.y);for(let e=0;e<c.length;e++){const s=this._tiles[c[e]];if(s.holdingForFade())continue;const r=s.tileID,m=Math.pow(2,o.zoom-s.tileID.overscaledZ),p=i*s.queryPadding*t.EXTENT/s.tileSize/m,f=[r.getTilePoint(new t.MercatorCoordinate(h,u)),r.getTilePoint(new t.MercatorCoordinate(d,_))];if(f[0].x-p<t.EXTENT&&f[0].y-p<t.EXTENT&&f[1].x+p>=0&&f[1].y+p>=0){const t=n.map((t=>r.getTilePoint(t))),e=l.map((t=>r.getTilePoint(t)));a.push({tile:s,tileID:r,queryGeometry:t,cameraQueryGeometry:e,scale:m});}}return a}getVisibleCoordinates(t){const e=this.getRenderableIds(t).map((t=>this._tiles[t].tileID));for(const t of e)t.posMatrix=this.transform.calculatePosMatrix(t.toUnwrapped());return e}hasTransition(){if(this._source.hasTransition())return !0;if(Q(this._source.type)){const e=t.browser.now();for(const t in this._tiles)if(this._tiles[t].fadeEndTime>=e)return !0}return !1}setFeatureState(t,e,i){this._state.updateState(t=t||"_geojsonTileLayer",e,i);}removeFeatureState(t,e,i){this._state.removeFeatureState(t=t||"_geojsonTileLayer",e,i);}getFeatureState(t,e){return this._state.getState(t=t||"_geojsonTileLayer",e)}setDependencies(t,e,i){const s=this._tiles[t];s&&s.setDependencies(e,i);}reloadTilesForDependencies(t,e){for(const i in this._tiles)this._tiles[i].hasDependency(t,e)&&this._reloadTile(i,"reloading");this._cache.filter((i=>!i.hasDependency(t,e)));}}function J(t,e){const i=Math.abs(2*t.wrap)-+(t.wrap<0),s=Math.abs(2*e.wrap)-+(e.wrap<0);return t.overscaledZ-e.overscaledZ||s-i||e.canonical.y-t.canonical.y||e.canonical.x-t.canonical.x}function Q(t){return "raster"===t||"image"===t||"video"===t}Y.maxOverzooming=10,Y.maxUnderzooming=3;const tt="mapboxgl_preloaded_worker_pool";class et{constructor(){this.active={};}acquire(e){if(!this.workers)for(this.workers=[];this.workers.length<et.workerCount;)this.workers.push(new Worker(t.config.WORKER_URL));return this.active[e]=!0,this.workers.slice()}release(t){delete this.active[t],0===this.numActive()&&(this.workers.forEach((t=>{t.terminate();})),this.workers=null);}isPreloaded(){return !!this.active[tt]}numActive(){return Object.keys(this.active).length}}const it=Math.floor(t.browser.hardwareConcurrency/2);let st;function at(){return st||(st=new et),st}et.workerCount=t.isSafari(globalThis)?Math.max(Math.min(it,3),1):1;class ot{constructor(t,e){this.reset(t,e);}reset(t,e){this.points=t||[],this._distances=[0];for(let t=1;t<this.points.length;t++)this._distances[t]=this._distances[t-1]+this.points[t].dist(this.points[t-1]);this.length=this._distances[this._distances.length-1],this.padding=Math.min(e||0,.5*this.length),this.paddedLength=this.length-2*this.padding;}lerp(e){if(1===this.points.length)return this.points[0];e=t.clamp(e,0,1);let i=1,s=this._distances[i];const a=e*this.paddedLength+this.padding;for(;s<a&&i<this._distances.length;)s=this._distances[++i];const o=i-1,r=this._distances[o],n=s-r,l=n>0?(a-r)/n:0;return this.points[o].mult(1-l).add(this.points[i].mult(l))}}function rt(t,e){let i=!0;return "always"===t||"never"!==t&&"never"!==e||(i=!1),i}class nt{constructor(t,e,i){const s=this.boxCells=[],a=this.circleCells=[];this.xCellCount=Math.ceil(t/i),this.yCellCount=Math.ceil(e/i);for(let t=0;t<this.xCellCount*this.yCellCount;t++)s.push([]),a.push([]);this.circleKeys=[],this.boxKeys=[],this.bboxes=[],this.circles=[],this.width=t,this.height=e,this.xScale=this.xCellCount/t,this.yScale=this.yCellCount/e,this.boxUid=0,this.circleUid=0;}keysLength(){return this.boxKeys.length+this.circleKeys.length}insert(t,e,i,s,a){this._forEachCell(e,i,s,a,this._insertBoxCell,this.boxUid++),this.boxKeys.push(t),this.bboxes.push(e),this.bboxes.push(i),this.bboxes.push(s),this.bboxes.push(a);}insertCircle(t,e,i,s){this._forEachCell(e-s,i-s,e+s,i+s,this._insertCircleCell,this.circleUid++),this.circleKeys.push(t),this.circles.push(e),this.circles.push(i),this.circles.push(s);}_insertBoxCell(t,e,i,s,a,o){this.boxCells[a].push(o);}_insertCircleCell(t,e,i,s,a,o){this.circleCells[a].push(o);}_query(t,e,i,s,a,o,r){if(i<0||t>this.width||s<0||e>this.height)return [];const n=[];if(t<=0&&e<=0&&this.width<=i&&this.height<=s){if(a)return [{key:null,x1:t,y1:e,x2:i,y2:s}];for(let t=0;t<this.boxKeys.length;t++)n.push({key:this.boxKeys[t],x1:this.bboxes[4*t],y1:this.bboxes[4*t+1],x2:this.bboxes[4*t+2],y2:this.bboxes[4*t+3]});for(let t=0;t<this.circleKeys.length;t++){const e=this.circles[3*t],i=this.circles[3*t+1],s=this.circles[3*t+2];n.push({key:this.circleKeys[t],x1:e-s,y1:i-s,x2:e+s,y2:i+s});}}else this._forEachCell(t,e,i,s,this._queryCell,n,{hitTest:a,overlapMode:o,seenUids:{box:{},circle:{}}},r);return n}query(t,e,i,s){return this._query(t,e,i,s,!1,null)}hitTest(t,e,i,s,a,o){return this._query(t,e,i,s,!0,a,o).length>0}hitTestCircle(t,e,i,s,a){const o=t-i,r=t+i,n=e-i,l=e+i;if(r<0||o>this.width||l<0||n>this.height)return !1;const c=[];return this._forEachCell(o,n,r,l,this._queryCellCircle,c,{hitTest:!0,overlapMode:s,circle:{x:t,y:e,radius:i},seenUids:{box:{},circle:{}}},a),c.length>0}_queryCell(t,e,i,s,a,o,r,n){const{seenUids:l,hitTest:c,overlapMode:h}=r,u=this.boxCells[a];if(null!==u){const a=this.bboxes;for(const r of u)if(!l.box[r]){l.box[r]=!0;const u=4*r,d=this.boxKeys[r];if(t<=a[u+2]&&e<=a[u+3]&&i>=a[u+0]&&s>=a[u+1]&&(!n||n(d))&&(!c||!rt(h,d.overlapMode))&&(o.push({key:d,x1:a[u],y1:a[u+1],x2:a[u+2],y2:a[u+3]}),c))return !0}}const d=this.circleCells[a];if(null!==d){const a=this.circles;for(const r of d)if(!l.circle[r]){l.circle[r]=!0;const u=3*r,d=this.circleKeys[r];if(this._circleAndRectCollide(a[u],a[u+1],a[u+2],t,e,i,s)&&(!n||n(d))&&(!c||!rt(h,d.overlapMode))){const t=a[u],e=a[u+1],i=a[u+2];if(o.push({key:d,x1:t-i,y1:e-i,x2:t+i,y2:e+i}),c)return !0}}}return !1}_queryCellCircle(t,e,i,s,a,o,r,n){const{circle:l,seenUids:c,overlapMode:h}=r,u=this.boxCells[a];if(null!==u){const t=this.bboxes;for(const e of u)if(!c.box[e]){c.box[e]=!0;const i=4*e,s=this.boxKeys[e];if(this._circleAndRectCollide(l.x,l.y,l.radius,t[i+0],t[i+1],t[i+2],t[i+3])&&(!n||n(s))&&!rt(h,s.overlapMode))return o.push(!0),!0}}const d=this.circleCells[a];if(null!==d){const t=this.circles;for(const e of d)if(!c.circle[e]){c.circle[e]=!0;const i=3*e,s=this.circleKeys[e];if(this._circlesCollide(t[i],t[i+1],t[i+2],l.x,l.y,l.radius)&&(!n||n(s))&&!rt(h,s.overlapMode))return o.push(!0),!0}}}_forEachCell(t,e,i,s,a,o,r,n){const l=this._convertToXCellCoord(t),c=this._convertToYCellCoord(e),h=this._convertToXCellCoord(i),u=this._convertToYCellCoord(s);for(let d=l;d<=h;d++)for(let l=c;l<=u;l++)if(a.call(this,t,e,i,s,this.xCellCount*l+d,o,r,n))return}_convertToXCellCoord(t){return Math.max(0,Math.min(this.xCellCount-1,Math.floor(t*this.xScale)))}_convertToYCellCoord(t){return Math.max(0,Math.min(this.yCellCount-1,Math.floor(t*this.yScale)))}_circlesCollide(t,e,i,s,a,o){const r=s-t,n=a-e,l=i+o;return l*l>r*r+n*n}_circleAndRectCollide(t,e,i,s,a,o,r){const n=(o-s)/2,l=Math.abs(t-(s+n));if(l>n+i)return !1;const c=(r-a)/2,h=Math.abs(e-(a+c));if(h>c+i)return !1;if(l<=n||h<=c)return !0;const u=l-n,d=h-c;return u*u+d*d<=i*i}}function lt(e,i,s,a,o){const r=t.create();return i?(t.scale(r,r,[1/o,1/o,1]),s||t.rotateZ(r,r,a.angle)):t.multiply(r,a.labelPlaneMatrix,e),r}function ct(e,i,s,a,o){if(i){const i=t.clone(e);return t.scale(i,i,[o,o,1]),s||t.rotateZ(i,i,-a.angle),i}return a.glCoordMatrix}function ht(e,i,s){let a;s?(a=[e.x,e.y,s(e.x,e.y),1],t.transformMat4(a,a,i)):(a=[e.x,e.y,0,1],Et(a,a,i));const o=a[3];return {point:new t.Point(a[0]/o,a[1]/o),signedDistanceFromCamera:o}}function ut(t,e){return .5+t/e*.5}function dt(t,e){const i=t[0]/t[3],s=t[1]/t[3];return i>=-e[0]&&i<=e[0]&&s>=-e[1]&&s<=e[1]}function _t(e,i,s,a,o,r,n,l,c,h){const u=a?e.textSizeData:e.iconSizeData,d=t.evaluateSizeForZoom(u,s.transform.zoom),_=[256/s.width*2+1,256/s.height*2+1],m=a?e.text.dynamicLayoutVertexArray:e.icon.dynamicLayoutVertexArray;m.clear();const p=e.lineVertexArray,f=a?e.text.placedSymbolArray:e.icon.placedSymbolArray,g=s.transform.width/s.transform.height;let v=!1;for(let a=0;a<f.length;a++){const x=f.get(a);if(x.hidden||x.writingMode===t.WritingMode.vertical&&!v){Tt(x.numGlyphs,m);continue}let y;if(v=!1,h?(y=[x.anchorX,x.anchorY,h(x.anchorX,x.anchorY),1],t.transformMat4(y,y,i)):(y=[x.anchorX,x.anchorY,0,1],Et(y,y,i)),!dt(y,_)){Tt(x.numGlyphs,m);continue}const b=ut(s.transform.cameraToCenterDistance,y[3]),w=t.evaluateSizeForFeature(u,d,x),T=n?w/b:w*b,E=new t.Point(x.anchorX,x.anchorY),I=ht(E,o,h).point,S={projections:{},offsets:{}},C=ft(x,T,!1,l,i,o,r,e.glyphOffsetArray,p,m,I,E,S,g,c,h);v=C.useVertical,(C.notEnoughRoom||v||C.needsFlipping&&ft(x,T,!0,l,i,o,r,e.glyphOffsetArray,p,m,I,E,S,g,c,h).notEnoughRoom)&&Tt(x.numGlyphs,m);}a?e.text.dynamicLayoutVertexBuffer.updateData(m):e.icon.dynamicLayoutVertexBuffer.updateData(m);}function mt(t,e,i,s,a,o,r,n,l,c,h,u,d){const _=n.glyphStartIndex+n.numGlyphs,m=n.lineStartIndex,p=n.lineStartIndex+n.lineLength,f=e.getoffsetX(n.glyphStartIndex),g=e.getoffsetX(_-1),v=bt(t*f,i,s,a,o,r,n.segment,m,p,l,c,h,u,d);if(!v)return null;const x=bt(t*g,i,s,a,o,r,n.segment,m,p,l,c,h,u,d);return x?{first:v,last:x}:null}function pt(e,i,s,a){return e===t.WritingMode.horizontal&&Math.abs(s.y-i.y)>Math.abs(s.x-i.x)*a?{useVertical:!0}:(e===t.WritingMode.vertical?i.y<s.y:i.x>s.x)?{needsFlipping:!0}:null}function ft(e,i,s,a,o,r,n,l,c,h,u,d,_,m,p,f){const g=i/24,v=e.lineOffsetX*g,x=e.lineOffsetY*g;let y;if(e.numGlyphs>1){const t=e.glyphStartIndex+e.numGlyphs,i=e.lineStartIndex,o=e.lineStartIndex+e.lineLength,h=mt(g,l,v,x,s,u,d,e,c,r,_,p,f);if(!h)return {notEnoughRoom:!0};const b=ht(h.first.point,n,f).point,w=ht(h.last.point,n,f).point;if(a&&!s){const t=pt(e.writingMode,b,w,m);if(t)return t}y=[h.first];for(let a=e.glyphStartIndex+1;a<t-1;a++)y.push(bt(g*l.getoffsetX(a),v,x,s,u,d,e.segment,i,o,c,r,_,p,f));y.push(h.last);}else {if(a&&!s){const i=ht(d,o,f).point,s=e.lineStartIndex+e.segment+1,a=new t.Point(c.getx(s),c.gety(s)),r=ht(a,o,f),n=r.signedDistanceFromCamera>0?r.point:gt(d,a,i,1,o,f),l=pt(e.writingMode,i,n,m);if(l)return l}const i=bt(g*l.getoffsetX(e.glyphStartIndex),v,x,s,u,d,e.segment,e.lineStartIndex,e.lineStartIndex+e.lineLength,c,r,_,p,f);if(!i)return {notEnoughRoom:!0};y=[i];}for(const e of y)t.addDynamicAttributes(h,e.point,e.angle);return {}}function gt(t,e,i,s,a,o){const r=ht(t.add(t.sub(e)._unit()),a,o).point,n=i.sub(r);return i.add(n._mult(s/n.mag()))}function vt(e,i){const{projectionCache:s,lineVertexArray:a,labelPlaneMatrix:o,tileAnchorPoint:r,distanceFromAnchor:n,getElevation:l,previousVertex:c,direction:h,absOffsetX:u}=i;if(s.projections[e])return s.projections[e];const d=new t.Point(a.getx(e),a.gety(e)),_=ht(d,o,l);if(_.signedDistanceFromCamera>0)return s.projections[e]=_.point,_.point;const m=e-h;return gt(0===n?r:new t.Point(a.getx(m),a.gety(m)),d,c,u-n+1,o,l)}function xt(t,e,i){return t._unit()._perp()._mult(e*i)}function yt(e,i,s,a,o,r,n,l){const{projectionCache:c,direction:h}=l;if(c.offsets[e])return c.offsets[e];const u=s.add(i);if(e+h<a||e+h>=o)return c.offsets[e]=u,u;const d=vt(e+h,l),_=xt(d.sub(s),n,h),m=s.add(_),p=d.add(_);return c.offsets[e]=t.findLineIntersection(r,u,m,p)||u,c.offsets[e]}function bt(t,e,i,s,a,o,r,n,l,c,h,u,d,_){const m=s?t-e:t+e;let p=m>0?1:-1,f=0;s&&(p*=-1,f=Math.PI),p<0&&(f+=Math.PI);let g,v,x=p>0?n+r:n+r+1,y=a,b=a,w=0,T=0;const E=Math.abs(m),I=[];let S;for(;w+T<=E;){if(x+=p,x<n||x>=l)return null;w+=T,b=y,v=g;const t={projectionCache:u,lineVertexArray:c,labelPlaneMatrix:h,tileAnchorPoint:o,distanceFromAnchor:w,getElevation:_,previousVertex:b,direction:p,absOffsetX:E};if(y=vt(x,t),0===i)I.push(b),S=y.sub(b);else {let e;const s=y.sub(b);e=0===s.mag()?xt(vt(x+p,t).sub(y),i,p):xt(s,i,p),v||(v=b.add(e)),g=yt(x,e,y,n,l,v,i,t),I.push(v),S=g.sub(v);}T=S.mag();}const C=S._mult((E-w)/T)._add(v||b),P=f+Math.atan2(y.y-b.y,y.x-b.x);return I.push(C),{point:C,angle:d?P:0,path:I}}const wt=new Float32Array([-1/0,-1/0,0,-1/0,-1/0,0,-1/0,-1/0,0,-1/0,-1/0,0]);function Tt(t,e){for(let i=0;i<t;i++){const t=e.length;e.resize(t+4),e.float32.set(wt,3*t);}}function Et(t,e,i){const s=e[0],a=e[1];return t[0]=i[0]*s+i[4]*a+i[12],t[1]=i[1]*s+i[5]*a+i[13],t[3]=i[3]*s+i[7]*a+i[15],t}const It=100;class St{constructor(t,e=new nt(t.width+200,t.height+200,25),i=new nt(t.width+200,t.height+200,25)){this.transform=t,this.grid=e,this.ignoredGrid=i,this.pitchfactor=Math.cos(t._pitch)*t.cameraToCenterDistance,this.screenRightBoundary=t.width+It,this.screenBottomBoundary=t.height+It,this.gridRightBoundary=t.width+200,this.gridBottomBoundary=t.height+200,this.perspectiveRatioCutoff=.6;}placeCollisionBox(t,e,i,s,a,o){const r=this.projectAndGetPerspectiveRatio(s,t.anchorPointX,t.anchorPointY,o),n=i*r.perspectiveRatio,l=t.x1*n+r.point.x,c=t.y1*n+r.point.y,h=t.x2*n+r.point.x,u=t.y2*n+r.point.y;return !this.isInsideGrid(l,c,h,u)||"always"!==e&&this.grid.hitTest(l,c,h,u,e,a)||r.perspectiveRatio<this.perspectiveRatioCutoff?{box:[],offscreen:!1}:{box:[l,c,h,u],offscreen:this.isOffscreen(l,c,h,u)}}placeCollisionCircles(e,i,s,a,o,r,n,l,c,h,u,d,_,m){const p=[],f=new t.Point(i.anchorX,i.anchorY),g=ht(f,r,m),v=ut(this.transform.cameraToCenterDistance,g.signedDistanceFromCamera),x=(h?o/v:o*v)/t.ONE_EM,y=ht(f,n,m).point,b=mt(x,a,i.lineOffsetX*x,i.lineOffsetY*x,!1,y,f,i,s,n,{projections:{},offsets:{}},!1,m);let w=!1,T=!1,E=!0;if(b){const i=.5*d*v+_,s=new t.Point(-100,-100),a=new t.Point(this.screenRightBoundary,this.screenBottomBoundary),o=new ot,r=b.first,n=b.last;let h=[];for(let t=r.path.length-1;t>=1;t--)h.push(r.path[t]);for(let t=1;t<n.path.length;t++)h.push(n.path[t]);const f=2.5*i;if(l){const t=h.map((t=>ht(t,l,m)));h=t.some((t=>t.signedDistanceFromCamera<=0))?[]:t.map((t=>t.point));}let g=[];if(h.length>0){const e=h[0].clone(),i=h[0].clone();for(let t=1;t<h.length;t++)e.x=Math.min(e.x,h[t].x),e.y=Math.min(e.y,h[t].y),i.x=Math.max(i.x,h[t].x),i.y=Math.max(i.y,h[t].y);g=e.x>=s.x&&i.x<=a.x&&e.y>=s.y&&i.y<=a.y?[h]:i.x<s.x||e.x>a.x||i.y<s.y||e.y>a.y?[]:t.clipLine([h],s.x,s.y,a.x,a.y);}for(const t of g){o.reset(t,.25*i);let s=0;s=o.length<=.5*i?1:Math.ceil(o.paddedLength/f)+1;for(let t=0;t<s;t++){const a=t/Math.max(s-1,1),r=o.lerp(a),n=r.x+It,l=r.y+It;p.push(n,l,i,0);const h=n-i,d=l-i,_=n+i,m=l+i;if(E=E&&this.isOffscreen(h,d,_,m),T=T||this.isInsideGrid(h,d,_,m),"always"!==e&&this.grid.hitTestCircle(n,l,i,e,u)&&(w=!0,!c))return {circles:[],offscreen:!1,collisionDetected:w}}}}return {circles:!c&&w||!T||v<this.perspectiveRatioCutoff?[]:p,offscreen:E,collisionDetected:w}}queryRenderedSymbols(e){if(0===e.length||0===this.grid.keysLength()&&0===this.ignoredGrid.keysLength())return {};const i=[];let s=1/0,a=1/0,o=-1/0,r=-1/0;for(const n of e){const e=new t.Point(n.x+It,n.y+It);s=Math.min(s,e.x),a=Math.min(a,e.y),o=Math.max(o,e.x),r=Math.max(r,e.y),i.push(e);}const n=this.grid.query(s,a,o,r).concat(this.ignoredGrid.query(s,a,o,r)),l={},c={};for(const e of n){const s=e.key;if(void 0===l[s.bucketInstanceId]&&(l[s.bucketInstanceId]={}),l[s.bucketInstanceId][s.featureIndex])continue;const a=[new t.Point(e.x1,e.y1),new t.Point(e.x2,e.y1),new t.Point(e.x2,e.y2),new t.Point(e.x1,e.y2)];t.polygonIntersectsPolygon(i,a)&&(l[s.bucketInstanceId][s.featureIndex]=!0,void 0===c[s.bucketInstanceId]&&(c[s.bucketInstanceId]=[]),c[s.bucketInstanceId].push(s.featureIndex));}return c}insertCollisionBox(t,e,i,s,a,o){(i?this.ignoredGrid:this.grid).insert({bucketInstanceId:s,featureIndex:a,collisionGroupID:o,overlapMode:e},t[0],t[1],t[2],t[3]);}insertCollisionCircles(t,e,i,s,a,o){const r=i?this.ignoredGrid:this.grid,n={bucketInstanceId:s,featureIndex:a,collisionGroupID:o,overlapMode:e};for(let e=0;e<t.length;e+=4)r.insertCircle(n,t[e],t[e+1],t[e+2]);}projectAndGetPerspectiveRatio(e,i,s,a){let o;return a?(o=[i,s,a(i,s),1],t.transformMat4(o,o,e)):(o=[i,s,0,1],Et(o,o,e)),{point:new t.Point((o[0]/o[3]+1)/2*this.transform.width+It,(-o[1]/o[3]+1)/2*this.transform.height+It),perspectiveRatio:.5+this.transform.cameraToCenterDistance/o[3]*.5}}isOffscreen(t,e,i,s){return i<It||t>=this.screenRightBoundary||s<It||e>this.screenBottomBoundary}isInsideGrid(t,e,i,s){return i>=0&&t<this.gridRightBoundary&&s>=0&&e<this.gridBottomBoundary}getViewportMatrix(){const e=t.identity([]);return t.translate(e,e,[-100,-100,0]),e}}function Ct(e,i,s){return i*(t.EXTENT/(e.tileSize*Math.pow(2,s-e.tileID.overscaledZ)))}class Pt{constructor(t,e,i,s){this.opacity=t?Math.max(0,Math.min(1,t.opacity+(t.placed?e:-e))):s&&i?1:0,this.placed=i;}isHidden(){return 0===this.opacity&&!this.placed}}class Dt{constructor(t,e,i,s,a){this.text=new Pt(t?t.text:null,e,i,a),this.icon=new Pt(t?t.icon:null,e,s,a);}isHidden(){return this.text.isHidden()&&this.icon.isHidden()}}class Mt{constructor(t,e,i){this.text=t,this.icon=e,this.skipFade=i;}}class zt{constructor(){this.invProjMatrix=t.create(),this.viewportMatrix=t.create(),this.circles=[];}}class At{constructor(t,e,i,s,a){this.bucketInstanceId=t,this.featureIndex=e,this.sourceLayerIndex=i,this.bucketIndex=s,this.tileID=a;}}class Lt{constructor(t){this.crossSourceCollisions=t,this.maxGroupID=0,this.collisionGroups={};}get(t){if(this.crossSourceCollisions)return {ID:0,predicate:null};if(!this.collisionGroups[t]){const e=++this.maxGroupID;this.collisionGroups[t]={ID:e,predicate:t=>t.collisionGroupID===e};}return this.collisionGroups[t]}}function Rt(e,i,s,a,o){const{horizontalAlign:r,verticalAlign:n}=t.getAnchorAlignment(e);return new t.Point(-(r-.5)*i+a[0]*o,-(n-.5)*s+a[1]*o)}function kt(e,i,s,a,o,r){const{x1:n,x2:l,y1:c,y2:h,anchorPointX:u,anchorPointY:d}=e,_=new t.Point(i,s);return a&&_._rotate(o?r:-r),{x1:n+_.x,y1:c+_.y,x2:l+_.x,y2:h+_.y,anchorPointX:u,anchorPointY:d}}class Ft{constructor(t,e,i,s,a){this.transform=t.clone(),this.terrain=e,this.collisionIndex=new St(this.transform),this.placements={},this.opacities={},this.variableOffsets={},this.stale=!1,this.commitTime=0,this.fadeDuration=i,this.retainedQueryData={},this.collisionGroups=new Lt(s),this.collisionCircleArrays={},this.prevPlacement=a,a&&(a.prevPlacement=void 0),this.placedOrientations={};}getBucketParts(e,i,s,a){const o=s.getBucket(i),r=s.latestFeatureIndex;if(!o||!r||i.id!==o.layerIds[0])return;const n=s.collisionBoxArray,l=o.layers[0].layout,c=Math.pow(2,this.transform.zoom-s.tileID.overscaledZ),h=s.tileSize/t.EXTENT,u=this.transform.calculatePosMatrix(s.tileID.toUnwrapped()),d="map"===l.get("text-pitch-alignment"),_="map"===l.get("text-rotation-alignment"),m=Ct(s,1,this.transform.zoom),p=lt(u,d,_,this.transform,m);let f=null;if(d){const e=ct(u,d,_,this.transform,m);f=t.multiply([],this.transform.labelPlaneMatrix,e);}this.retainedQueryData[o.bucketInstanceId]=new At(o.bucketInstanceId,r,o.sourceLayerIndex,o.index,s.tileID);const g={bucket:o,layout:l,posMatrix:u,textLabelPlaneMatrix:p,labelToScreenMatrix:f,scale:c,textPixelRatio:h,holdingForFade:s.holdingForFade(),collisionBoxArray:n,partiallyEvaluatedTextSize:t.evaluateSizeForZoom(o.textSizeData,this.transform.zoom),collisionGroup:this.collisionGroups.get(o.sourceID)};if(a)for(const t of o.sortKeyRanges){const{sortKey:i,symbolInstanceStart:s,symbolInstanceEnd:a}=t;e.push({sortKey:i,symbolInstanceStart:s,symbolInstanceEnd:a,parameters:g});}else e.push({symbolInstanceStart:0,symbolInstanceEnd:o.symbolInstances.length,parameters:g});}attemptAnchorPlacement(e,i,s,a,o,r,n,l,c,h,u,d,_,m,p,f){const g=t.TextAnchorEnum[e.textAnchor],v=[e.textOffset0,e.textOffset1],x=Rt(g,s,a,v,o),y=this.collisionIndex.placeCollisionBox(kt(i,x.x,x.y,r,n,this.transform.angle),u,l,c,h.predicate,f);if((!p||0!==this.collisionIndex.placeCollisionBox(kt(p,x.x,x.y,r,n,this.transform.angle),u,l,c,h.predicate,f).box.length)&&y.box.length>0){let t;if(this.prevPlacement&&this.prevPlacement.variableOffsets[d.crossTileID]&&this.prevPlacement.placements[d.crossTileID]&&this.prevPlacement.placements[d.crossTileID].text&&(t=this.prevPlacement.variableOffsets[d.crossTileID].anchor),0===d.crossTileID)throw new Error("symbolInstance.crossTileID can't be 0");return this.variableOffsets[d.crossTileID]={textOffset:v,width:s,height:a,anchor:g,textBoxScale:o,prevAnchor:t},this.markUsedJustification(_,g,d,m),_.allowVerticalPlacement&&(this.markUsedOrientation(_,m,d),this.placedOrientations[d.crossTileID]=m),{shift:x,placedGlyphBoxes:y}}}placeLayerBucketPart(e,i,s){const{bucket:a,layout:o,posMatrix:r,textLabelPlaneMatrix:n,labelToScreenMatrix:l,textPixelRatio:c,holdingForFade:h,collisionBoxArray:u,partiallyEvaluatedTextSize:d,collisionGroup:_}=e.parameters,m=o.get("text-optional"),p=o.get("icon-optional"),f=t.getOverlapMode(o,"text-overlap","text-allow-overlap"),g="always"===f,v=t.getOverlapMode(o,"icon-overlap","icon-allow-overlap"),x="always"===v,y="map"===o.get("text-rotation-alignment"),b="map"===o.get("text-pitch-alignment"),w="none"!==o.get("icon-text-fit"),T="viewport-y"===o.get("symbol-z-order"),E=g&&(x||!a.hasIconData()||p),I=x&&(g||!a.hasTextData()||m);!a.collisionArrays&&u&&a.deserializeCollisionBoxes(u);const S=this.retainedQueryData[a.bucketInstanceId].tileID,C=this.terrain?(t,e)=>this.terrain.getElevation(S,t,e):null,P=(e,u)=>{var x,T;if(i[e.crossTileID])return;if(h)return void(this.placements[e.crossTileID]=new Mt(!1,!1,!1));let S=!1,P=!1,D=!0,M=null,z={box:null,offscreen:null},A={box:null,offscreen:null},L=null,R=null,k=null,F=0,B=0,U=0;u.textFeatureIndex?F=u.textFeatureIndex:e.useRuntimeCollisionCircles&&(F=e.featureIndex),u.verticalTextFeatureIndex&&(B=u.verticalTextFeatureIndex);const O=u.textBox;if(O){const i=i=>{let s=t.WritingMode.horizontal;if(a.allowVerticalPlacement&&!i&&this.prevPlacement){const t=this.prevPlacement.placedOrientations[e.crossTileID];t&&(this.placedOrientations[e.crossTileID]=t,s=t,this.markUsedOrientation(a,s,e));}return s},s=(i,s)=>{if(a.allowVerticalPlacement&&e.numVerticalGlyphVertices>0&&u.verticalTextBox){for(const e of a.writingModes)if(e===t.WritingMode.vertical?(z=s(),A=z):z=i(),z&&z.box&&z.box.length)break}else z=i();},o=e.textAnchorOffsetStartIndex,n=e.textAnchorOffsetEndIndex;if(n===o){const o=(t,i)=>{const s=this.collisionIndex.placeCollisionBox(t,f,c,r,_.predicate,C);return s&&s.box&&s.box.length&&(this.markUsedOrientation(a,i,e),this.placedOrientations[e.crossTileID]=i),s};s((()=>o(O,t.WritingMode.horizontal)),(()=>{const i=u.verticalTextBox;return a.allowVerticalPlacement&&e.numVerticalGlyphVertices>0&&i?o(i,t.WritingMode.vertical):{box:null,offscreen:null}})),i(z&&z.box&&z.box.length);}else {let l=t.TextAnchorEnum[null===(T=null===(x=this.prevPlacement)||void 0===x?void 0:x.variableOffsets[e.crossTileID])||void 0===T?void 0:T.anchor];const h=(t,i,s)=>{const h=t.x2-t.x1,u=t.y2-t.y1,d=e.textBoxScale,m=w&&"never"===v?i:null;let p={box:[],offscreen:!1},g="never"===f?1:2,x="never";l&&g++;for(let i=0;i<g;i++){for(let i=o;i<n;i++){const o=a.textAnchorOffsets.get(i);if(l&&o.textAnchor!==l)continue;const n=this.attemptAnchorPlacement(o,t,h,u,d,y,b,c,r,_,x,e,a,s,m,C);if(n&&(p=n.placedGlyphBoxes,p&&p.box&&p.box.length))return S=!0,M=n.shift,p}l?l=null:x=f;}return p};s((()=>h(O,u.iconBox,t.WritingMode.horizontal)),(()=>{const i=u.verticalTextBox;return a.allowVerticalPlacement&&!(z&&z.box&&z.box.length)&&e.numVerticalGlyphVertices>0&&i?h(i,u.verticalIconBox,t.WritingMode.vertical):{box:null,offscreen:null}})),z&&(S=z.box,D=z.offscreen);const d=i(z&&z.box);if(!S&&this.prevPlacement){const t=this.prevPlacement.variableOffsets[e.crossTileID];t&&(this.variableOffsets[e.crossTileID]=t,this.markUsedJustification(a,t.anchor,e,d));}}}if(L=z,S=L&&L.box&&L.box.length>0,D=L&&L.offscreen,e.useRuntimeCollisionCircles){const i=a.text.placedSymbolArray.get(e.centerJustifiedTextSymbolIndex),c=t.evaluateSizeForFeature(a.textSizeData,d,i),h=o.get("text-padding");R=this.collisionIndex.placeCollisionCircles(f,i,a.lineVertexArray,a.glyphOffsetArray,c,r,n,l,s,b,_.predicate,e.collisionCircleDiameter,h,C),R.circles.length&&R.collisionDetected&&!s&&t.warnOnce("Collisions detected, but collision boxes are not shown"),S=g||R.circles.length>0&&!R.collisionDetected,D=D&&R.offscreen;}if(u.iconFeatureIndex&&(U=u.iconFeatureIndex),u.iconBox){const t=t=>{const e=w&&M?kt(t,M.x,M.y,y,b,this.transform.angle):t;return this.collisionIndex.placeCollisionBox(e,v,c,r,_.predicate,C)};A&&A.box&&A.box.length&&u.verticalIconBox?(k=t(u.verticalIconBox),P=k.box.length>0):(k=t(u.iconBox),P=k.box.length>0),D=D&&k.offscreen;}const N=m||0===e.numHorizontalGlyphVertices&&0===e.numVerticalGlyphVertices,Z=p||0===e.numIconVertices;if(N||Z?Z?N||(P=P&&S):S=P&&S:P=S=P&&S,S&&L&&L.box&&this.collisionIndex.insertCollisionBox(L.box,f,o.get("text-ignore-placement"),a.bucketInstanceId,A&&A.box&&B?B:F,_.ID),P&&k&&this.collisionIndex.insertCollisionBox(k.box,v,o.get("icon-ignore-placement"),a.bucketInstanceId,U,_.ID),R&&(S&&this.collisionIndex.insertCollisionCircles(R.circles,f,o.get("text-ignore-placement"),a.bucketInstanceId,F,_.ID),s)){const t=a.bucketInstanceId;let e=this.collisionCircleArrays[t];void 0===e&&(e=this.collisionCircleArrays[t]=new zt);for(let t=0;t<R.circles.length;t+=4)e.circles.push(R.circles[t+0]),e.circles.push(R.circles[t+1]),e.circles.push(R.circles[t+2]),e.circles.push(R.collisionDetected?1:0);}if(0===e.crossTileID)throw new Error("symbolInstance.crossTileID can't be 0");if(0===a.bucketInstanceId)throw new Error("bucket.bucketInstanceId can't be 0");this.placements[e.crossTileID]=new Mt(S||E,P||I,D||a.justReloaded),i[e.crossTileID]=!0;};if(T){if(0!==e.symbolInstanceStart)throw new Error("bucket.bucketInstanceId should be 0");const t=a.getSortedSymbolIndexes(this.transform.angle);for(let e=t.length-1;e>=0;--e){const i=t[e];P(a.symbolInstances.get(i),a.collisionArrays[i]);}}else for(let t=e.symbolInstanceStart;t<e.symbolInstanceEnd;t++)P(a.symbolInstances.get(t),a.collisionArrays[t]);if(s&&a.bucketInstanceId in this.collisionCircleArrays){const e=this.collisionCircleArrays[a.bucketInstanceId];t.invert(e.invProjMatrix,r),e.viewportMatrix=this.collisionIndex.getViewportMatrix();}a.justReloaded=!1;}markUsedJustification(e,i,s,a){let o;o=a===t.WritingMode.vertical?s.verticalPlacedTextSymbolIndex:{left:s.leftJustifiedTextSymbolIndex,center:s.centerJustifiedTextSymbolIndex,right:s.rightJustifiedTextSymbolIndex}[t.getAnchorJustification(i)];const r=[s.leftJustifiedTextSymbolIndex,s.centerJustifiedTextSymbolIndex,s.rightJustifiedTextSymbolIndex,s.verticalPlacedTextSymbolIndex];for(const t of r)t>=0&&(e.text.placedSymbolArray.get(t).crossTileID=o>=0&&t!==o?0:s.crossTileID);}markUsedOrientation(e,i,s){const a=i===t.WritingMode.horizontal||i===t.WritingMode.horizontalOnly?i:0,o=i===t.WritingMode.vertical?i:0,r=[s.leftJustifiedTextSymbolIndex,s.centerJustifiedTextSymbolIndex,s.rightJustifiedTextSymbolIndex];for(const t of r)e.text.placedSymbolArray.get(t).placedOrientation=a;s.verticalPlacedTextSymbolIndex&&(e.text.placedSymbolArray.get(s.verticalPlacedTextSymbolIndex).placedOrientation=o);}commit(t){this.commitTime=t,this.zoomAtLastRecencyCheck=this.transform.zoom;const e=this.prevPlacement;let i=!1;this.prevZoomAdjustment=e?e.zoomAdjustment(this.transform.zoom):0;const s=e?e.symbolFadeChange(t):1,a=e?e.opacities:{},o=e?e.variableOffsets:{},r=e?e.placedOrientations:{};for(const t in this.placements){const e=this.placements[t],o=a[t];o?(this.opacities[t]=new Dt(o,s,e.text,e.icon),i=i||e.text!==o.text.placed||e.icon!==o.icon.placed):(this.opacities[t]=new Dt(null,s,e.text,e.icon,e.skipFade),i=i||e.text||e.icon);}for(const t in a){const e=a[t];if(!this.opacities[t]){const a=new Dt(e,s,!1,!1);a.isHidden()||(this.opacities[t]=a,i=i||e.text.placed||e.icon.placed);}}for(const t in o)this.variableOffsets[t]||!this.opacities[t]||this.opacities[t].isHidden()||(this.variableOffsets[t]=o[t]);for(const t in r)this.placedOrientations[t]||!this.opacities[t]||this.opacities[t].isHidden()||(this.placedOrientations[t]=r[t]);if(e&&void 0===e.lastPlacementChangeTime)throw new Error("Last placement time for previous placement is not defined");i?this.lastPlacementChangeTime=t:"number"!=typeof this.lastPlacementChangeTime&&(this.lastPlacementChangeTime=e?e.lastPlacementChangeTime:t);}updateLayerOpacities(t,e){const i={};for(const s of e){const e=s.getBucket(t);e&&s.latestFeatureIndex&&t.id===e.layerIds[0]&&this.updateBucketOpacities(e,i,s.collisionBoxArray);}}updateBucketOpacities(e,i,s){e.hasTextData()&&(e.text.opacityVertexArray.clear(),e.text.hasVisibleVertices=!1),e.hasIconData()&&(e.icon.opacityVertexArray.clear(),e.icon.hasVisibleVertices=!1),e.hasIconCollisionBoxData()&&e.iconCollisionBox.collisionVertexArray.clear(),e.hasTextCollisionBoxData()&&e.textCollisionBox.collisionVertexArray.clear();const a=e.layers[0],o=a.layout,r=new Dt(null,0,!1,!1,!0),n=o.get("text-allow-overlap"),l=o.get("icon-allow-overlap"),c=a._unevaluatedLayout.hasValue("text-variable-anchor")||a._unevaluatedLayout.hasValue("text-variable-anchor-offset"),h="map"===o.get("text-rotation-alignment"),u="map"===o.get("text-pitch-alignment"),d="none"!==o.get("icon-text-fit"),_=new Dt(null,0,n&&(l||!e.hasIconData()||o.get("icon-optional")),l&&(n||!e.hasTextData()||o.get("text-optional")),!0);!e.collisionArrays&&s&&(e.hasIconCollisionBoxData()||e.hasTextCollisionBoxData())&&e.deserializeCollisionBoxes(s);const m=(t,e,i)=>{for(let s=0;s<e/4;s++)t.opacityVertexArray.emplaceBack(i);t.hasVisibleVertices=t.hasVisibleVertices||i!==$t;};for(let s=0;s<e.symbolInstances.length;s++){const a=e.symbolInstances.get(s),{numHorizontalGlyphVertices:o,numVerticalGlyphVertices:n,crossTileID:l}=a;let p=this.opacities[l];i[l]?p=r:p||(p=_,this.opacities[l]=p),i[l]=!0;const f=a.numIconVertices>0,g=this.placedOrientations[a.crossTileID],v=g===t.WritingMode.vertical,x=g===t.WritingMode.horizontal||g===t.WritingMode.horizontalOnly;if(o>0||n>0){const t=jt(p.text);m(e.text,o,v?$t:t),m(e.text,n,x?$t:t);const i=p.text.isHidden();[a.rightJustifiedTextSymbolIndex,a.centerJustifiedTextSymbolIndex,a.leftJustifiedTextSymbolIndex].forEach((t=>{t>=0&&(e.text.placedSymbolArray.get(t).hidden=i||v?1:0);})),a.verticalPlacedTextSymbolIndex>=0&&(e.text.placedSymbolArray.get(a.verticalPlacedTextSymbolIndex).hidden=i||x?1:0);const s=this.variableOffsets[a.crossTileID];s&&this.markUsedJustification(e,s.anchor,a,g);const r=this.placedOrientations[a.crossTileID];r&&(this.markUsedJustification(e,"left",a,r),this.markUsedOrientation(e,r,a));}if(f){const t=jt(p.icon),i=!(d&&a.verticalPlacedIconSymbolIndex&&v);a.placedIconSymbolIndex>=0&&(m(e.icon,a.numIconVertices,i?t:$t),e.icon.placedSymbolArray.get(a.placedIconSymbolIndex).hidden=p.icon.isHidden()),a.verticalPlacedIconSymbolIndex>=0&&(m(e.icon,a.numVerticalIconVertices,i?$t:t),e.icon.placedSymbolArray.get(a.verticalPlacedIconSymbolIndex).hidden=p.icon.isHidden());}if(e.hasIconCollisionBoxData()||e.hasTextCollisionBoxData()){const i=e.collisionArrays[s];if(i){let s=new t.Point(0,0);if(i.textBox||i.verticalTextBox){let t=!0;if(c){const e=this.variableOffsets[l];e?(s=Rt(e.anchor,e.width,e.height,e.textOffset,e.textBoxScale),h&&s._rotate(u?this.transform.angle:-this.transform.angle)):t=!1;}i.textBox&&Bt(e.textCollisionBox.collisionVertexArray,p.text.placed,!t||v,s.x,s.y),i.verticalTextBox&&Bt(e.textCollisionBox.collisionVertexArray,p.text.placed,!t||x,s.x,s.y);}const a=Boolean(!x&&i.verticalIconBox);i.iconBox&&Bt(e.iconCollisionBox.collisionVertexArray,p.icon.placed,a,d?s.x:0,d?s.y:0),i.verticalIconBox&&Bt(e.iconCollisionBox.collisionVertexArray,p.icon.placed,!a,d?s.x:0,d?s.y:0);}}}if(e.sortFeatures(this.transform.angle),this.retainedQueryData[e.bucketInstanceId]&&(this.retainedQueryData[e.bucketInstanceId].featureSortOrder=e.featureSortOrder),e.hasTextData()&&e.text.opacityVertexBuffer&&e.text.opacityVertexBuffer.updateData(e.text.opacityVertexArray),e.hasIconData()&&e.icon.opacityVertexBuffer&&e.icon.opacityVertexBuffer.updateData(e.icon.opacityVertexArray),e.hasIconCollisionBoxData()&&e.iconCollisionBox.collisionVertexBuffer&&e.iconCollisionBox.collisionVertexBuffer.updateData(e.iconCollisionBox.collisionVertexArray),e.hasTextCollisionBoxData()&&e.textCollisionBox.collisionVertexBuffer&&e.textCollisionBox.collisionVertexBuffer.updateData(e.textCollisionBox.collisionVertexArray),e.text.opacityVertexArray.length!==e.text.layoutVertexArray.length/4)throw new Error(`bucket.text.opacityVertexArray.length (= ${e.text.opacityVertexArray.length}) !== bucket.text.layoutVertexArray.length (= ${e.text.layoutVertexArray.length}) / 4`);if(e.icon.opacityVertexArray.length!==e.icon.layoutVertexArray.length/4)throw new Error(`bucket.icon.opacityVertexArray.length (= ${e.icon.opacityVertexArray.length}) !== bucket.icon.layoutVertexArray.length (= ${e.icon.layoutVertexArray.length}) / 4`);if(e.bucketInstanceId in this.collisionCircleArrays){const t=this.collisionCircleArrays[e.bucketInstanceId];e.placementInvProjMatrix=t.invProjMatrix,e.placementViewportMatrix=t.viewportMatrix,e.collisionCircleArray=t.circles,delete this.collisionCircleArrays[e.bucketInstanceId];}}symbolFadeChange(t){return 0===this.fadeDuration?1:(t-this.commitTime)/this.fadeDuration+this.prevZoomAdjustment}zoomAdjustment(t){return Math.max(0,(this.transform.zoom-t)/1.5)}hasTransitions(t){return this.stale||t-this.lastPlacementChangeTime<this.fadeDuration}stillRecent(t,e){const i=this.zoomAtLastRecencyCheck===e?1-this.zoomAdjustment(e):1;return this.zoomAtLastRecencyCheck=e,this.commitTime+this.fadeDuration*i>t}setStale(){this.stale=!0;}}function Bt(t,e,i,s,a){t.emplaceBack(e?1:0,i?1:0,s||0,a||0),t.emplaceBack(e?1:0,i?1:0,s||0,a||0),t.emplaceBack(e?1:0,i?1:0,s||0,a||0),t.emplaceBack(e?1:0,i?1:0,s||0,a||0);}const Ut=Math.pow(2,25),Ot=Math.pow(2,24),Nt=Math.pow(2,17),Zt=Math.pow(2,16),Gt=Math.pow(2,9),Vt=Math.pow(2,8),qt=Math.pow(2,1);function jt(t){if(0===t.opacity&&!t.placed)return 0;if(1===t.opacity&&t.placed)return 4294967295;const e=t.placed?1:0,i=Math.floor(127*t.opacity);return i*Ut+e*Ot+i*Nt+e*Zt+i*Gt+e*Vt+i*qt+e}const $t=0;class Xt{constructor(t){this._sortAcrossTiles="viewport-y"!==t.layout.get("symbol-z-order")&&!t.layout.get("symbol-sort-key").isConstant(),this._currentTileIndex=0,this._currentPartIndex=0,this._seenCrossTileIDs={},this._bucketParts=[];}continuePlacement(t,e,i,s,a){const o=this._bucketParts;for(;this._currentTileIndex<t.length;)if(e.getBucketParts(o,s,t[this._currentTileIndex],this._sortAcrossTiles),this._currentTileIndex++,a())return !0;for(this._sortAcrossTiles&&(this._sortAcrossTiles=!1,o.sort(((t,e)=>t.sortKey-e.sortKey)));this._currentPartIndex<o.length;)if(e.placeLayerBucketPart(o[this._currentPartIndex],this._seenCrossTileIDs,i),this._currentPartIndex++,a())return !0;return !1}}class Wt{constructor(t,e,i,s,a,o,r,n){this.placement=new Ft(t,e,o,r,n),this._currentPlacementIndex=i.length-1,this._forceFullPlacement=s,this._showCollisionBoxes=a,this._done=!1;}isDone(){return this._done}continuePlacement(e,i,s){const a=t.browser.now(),o=()=>!this._forceFullPlacement&&t.browser.now()-a>2;for(;this._currentPlacementIndex>=0;){const t=i[e[this._currentPlacementIndex]],a=this.placement.collisionIndex.transform.zoom;if("symbol"===t.type&&(!t.minzoom||t.minzoom<=a)&&(!t.maxzoom||t.maxzoom>a)){if(this._inProgressLayer||(this._inProgressLayer=new Xt(t)),this._inProgressLayer.continuePlacement(s[t.source],this.placement,this._showCollisionBoxes,t,o))return;delete this._inProgressLayer;}this._currentPlacementIndex--;}this._done=!0;}commit(t){return this.placement.commit(t),this.placement}}const Ht=512/t.EXTENT/2;class Kt{constructor(e,i,s){this.tileID=e,this.bucketInstanceId=s,this._symbolsByKey={};const a=new Map;for(let t=0;t<i.length;t++){const e=i.get(t),s=e.key,o=a.get(s);o?o.push(e):a.set(s,[e]);}for(const[e,i]of a){const s={positions:i.map((t=>({x:Math.floor(t.anchorX*Ht),y:Math.floor(t.anchorY*Ht)}))),crossTileIDs:i.map((t=>t.crossTileID))};if(s.positions.length>128){const e=new t.KDBush(s.positions.length,16,Uint16Array);for(const{x:t,y:i}of s.positions)e.add(t,i);e.finish(),delete s.positions,s.index=e;}this._symbolsByKey[e]=s;}}getScaledCoordinates(e,i){const{x:s,y:a,z:o}=this.tileID.canonical,{x:r,y:n,z:l}=i.canonical,c=Ht/Math.pow(2,l-o),h=(n*t.EXTENT+e.anchorY)*c,u=a*t.EXTENT*Ht;return {x:Math.floor((r*t.EXTENT+e.anchorX)*c-s*t.EXTENT*Ht),y:Math.floor(h-u)}}findMatches(t,e,i){const s=this.tileID.canonical.z<e.canonical.z?1:Math.pow(2,this.tileID.canonical.z-e.canonical.z);for(let a=0;a<t.length;a++){const o=t.get(a);if(o.crossTileID)continue;const r=this._symbolsByKey[o.key];if(!r)continue;const n=this.getScaledCoordinates(o,e);if(r.index){const t=r.index.range(n.x-s,n.y-s,n.x+s,n.y+s).sort();for(const e of t){const t=r.crossTileIDs[e];if(!i[t]){i[t]=!0,o.crossTileID=t;break}}}else if(r.positions)for(let t=0;t<r.positions.length;t++){const e=r.positions[t],a=r.crossTileIDs[t];if(Math.abs(e.x-n.x)<=s&&Math.abs(e.y-n.y)<=s&&!i[a]){i[a]=!0,o.crossTileID=a;break}}}}getCrossTileIDsLists(){return Object.values(this._symbolsByKey).map((({crossTileIDs:t})=>t))}}class Yt{constructor(){this.maxCrossTileID=0;}generate(){return ++this.maxCrossTileID}}class Jt{constructor(){this.indexes={},this.usedCrossTileIDs={},this.lng=0;}handleWrapJump(t){const e=Math.round((t-this.lng)/360);if(0!==e)for(const t in this.indexes){const i=this.indexes[t],s={};for(const t in i){const a=i[t];a.tileID=a.tileID.unwrapTo(a.tileID.wrap+e),s[a.tileID.key]=a;}this.indexes[t]=s;}this.lng=t;}addBucket(t,e,i){if(this.indexes[t.overscaledZ]&&this.indexes[t.overscaledZ][t.key]){if(this.indexes[t.overscaledZ][t.key].bucketInstanceId===e.bucketInstanceId)return !1;this.removeBucketCrossTileIDs(t.overscaledZ,this.indexes[t.overscaledZ][t.key]);}for(let t=0;t<e.symbolInstances.length;t++)e.symbolInstances.get(t).crossTileID=0;this.usedCrossTileIDs[t.overscaledZ]||(this.usedCrossTileIDs[t.overscaledZ]={});const s=this.usedCrossTileIDs[t.overscaledZ];for(const i in this.indexes){const a=this.indexes[i];if(Number(i)>t.overscaledZ)for(const i in a){const o=a[i];o.tileID.isChildOf(t)&&o.findMatches(e.symbolInstances,t,s);}else {const o=a[t.scaledTo(Number(i)).key];o&&o.findMatches(e.symbolInstances,t,s);}}for(let t=0;t<e.symbolInstances.length;t++){const a=e.symbolInstances.get(t);a.crossTileID||(a.crossTileID=i.generate(),s[a.crossTileID]=!0);}return void 0===this.indexes[t.overscaledZ]&&(this.indexes[t.overscaledZ]={}),this.indexes[t.overscaledZ][t.key]=new Kt(t,e.symbolInstances,e.bucketInstanceId),!0}removeBucketCrossTileIDs(t,e){for(const i of e.getCrossTileIDsLists())for(const e of i)delete this.usedCrossTileIDs[t][e];}removeStaleBuckets(t){let e=!1;for(const i in this.indexes){const s=this.indexes[i];for(const a in s)t[s[a].bucketInstanceId]||(this.removeBucketCrossTileIDs(i,s[a]),delete s[a],e=!0);}return e}}class Qt{constructor(){this.layerIndexes={},this.crossTileIDs=new Yt,this.maxBucketInstanceId=0,this.bucketsInCurrentPlacement={};}addLayer(t,e,i){let s=this.layerIndexes[t.id];void 0===s&&(s=this.layerIndexes[t.id]=new Jt);let a=!1;const o={};s.handleWrapJump(i);for(const i of e){const e=i.getBucket(t);e&&t.id===e.layerIds[0]&&(e.bucketInstanceId||(e.bucketInstanceId=++this.maxBucketInstanceId),s.addBucket(i.tileID,e,this.crossTileIDs)&&(a=!0),o[e.bucketInstanceId]=!0);}return s.removeStaleBuckets(o)&&(a=!0),a}pruneUnusedLayers(t){const e={};t.forEach((t=>{e[t]=!0;}));for(const t in this.layerIndexes)e[t]||delete this.layerIndexes[t];}}const te=(e,i)=>t.emitValidationErrors(e,i&&i.filter((t=>"source.canvas"!==t.identifier))),ee=t.pick(t.operations,["addLayer","removeLayer","setPaintProperty","setLayoutProperty","setFilter","addSource","removeSource","setLayerZoomRange","setLight","setTransition","setGeoJSONSourceData","setGlyphs","setSprite"]),ie=t.pick(t.operations,["setCenter","setZoom","setBearing","setPitch"]),se=t.emptyStyle();class ae extends t.Evented{constructor(e,i={}){super(),this.map=e,this.dispatcher=new z(at(),this,e._getMapId()),this.imageManager=new b,this.imageManager.setEventedParent(this),this.glyphManager=new I(e._requestManager,i.localIdeographFontFamily),this.lineAtlas=new M(256,512),this.crossTileSymbolIndex=new Qt,this._spritesImagesIds={},this._layers={},this._order=[],this.sourceCaches={},this.zoomHistory=new t.ZoomHistory,this._loaded=!1,this._availableImages=[],this._resetUpdates(),this.dispatcher.broadcast("setReferrer",t.getReferrer());const s=this;this._rtlTextPluginCallback=ae.registerForPluginStateChange((e=>{s.dispatcher.broadcast("syncRTLPluginState",{pluginStatus:e.pluginStatus,pluginURL:e.pluginURL},((e,i)=>{if(t.triggerPluginCompletionEvent(e),i&&i.every((t=>t)))for(const t in s.sourceCaches){const e=s.sourceCaches[t].getSource().type;"vector"!==e&&"geojson"!==e||s.sourceCaches[t].reload();}}));})),this.on("data",(t=>{if("source"!==t.dataType||"metadata"!==t.sourceDataType)return;const e=this.sourceCaches[t.sourceId];if(!e)return;const i=e.getSource();if(i&&i.vectorLayerIds)for(const t in this._layers){const e=this._layers[t];e.source===i.id&&this._validateLayer(e);}}));}loadURL(e,i={},s){this.fire(new t.Event("dataloading",{dataType:"style"})),i.validate="boolean"!=typeof i.validate||i.validate;const a=this.map._requestManager.transformRequest(e,h.Style);this._request=t.getJSON(a,((e,a)=>{this._request=null,e?this.fire(new t.ErrorEvent(e)):a&&this._load(a,i,s);}));}loadJSON(e,i={},s){this.fire(new t.Event("dataloading",{dataType:"style"})),this._request=t.browser.frame((()=>{this._request=null,i.validate=!1!==i.validate,this._load(e,i,s);}));}loadEmpty(){this.fire(new t.Event("dataloading",{dataType:"style"})),this._load(se,{validate:!1});}_load(e,i,s){var a;const o=i.transformStyle?i.transformStyle(s,e):e;if(!i.validate||!te(this,t.validateStyle(o))){this._loaded=!0,this.stylesheet=o;for(const t in o.sources)this.addSource(t,o.sources[t],{validate:!1});o.sprite?this._loadSprite(o.sprite):this.imageManager.setLoaded(!0),this.glyphManager.setURL(o.glyphs),this._createLayers(),this.light=new D(this.stylesheet.light),this.map.setTerrain(null!==(a=this.stylesheet.terrain)&&void 0!==a?a:null),this.fire(new t.Event("data",{dataType:"style"})),this.fire(new t.Event("style.load"));}}_createLayers(){const e=t.derefLayers(this.stylesheet.layers);this.dispatcher.broadcast("setLayers",e),this._order=e.map((t=>t.id)),this._layers={},this._serializedLayers=null;for(const i of e){const e=t.createStyleLayer(i);e.setEventedParent(this,{layer:{id:i.id}}),this._layers[i.id]=e;}}_loadSprite(e,i=!1,s=void 0){this.imageManager.setLoaded(!1),this._spriteRequest=function(e,i,s,a){const o=g(e),r=o.length,n=s>1?"@2x":"",l={},u={},d={};for(const{id:e,url:s}of o){const o=i.transformRequest(i.normalizeSpriteURL(s,n,".json"),h.SpriteJSON),_=`${e}_${o.url}`;l[_]=t.getJSON(o,((t,i)=>{delete l[_],u[e]=i,v(a,u,d,t,r);}));const m=i.transformRequest(i.normalizeSpriteURL(s,n,".png"),h.SpriteImage),p=`${e}_${m.url}`;l[p]=c.getImage(m,((t,i)=>{delete l[p],d[e]=i,v(a,u,d,t,r);}));}return {cancel(){for(const t of Object.values(l))t.cancel();}}}(e,this.map._requestManager,this.map.getPixelRatio(),((e,a)=>{if(this._spriteRequest=null,e)this.fire(new t.ErrorEvent(e));else if(a)for(const t in a){this._spritesImagesIds[t]=[];const e=this._spritesImagesIds[t]?this._spritesImagesIds[t].filter((t=>!(t in a))):[];for(const t of e)this.imageManager.removeImage(t),this._changedImages[t]=!0;for(const e in a[t]){const s="default"===t?e:`${t}:${e}`;this._spritesImagesIds[t].push(s),s in this.imageManager.images?this.imageManager.updateImage(s,a[t][e],!1):this.imageManager.addImage(s,a[t][e]),i&&(this._changedImages[s]=!0);}}this.imageManager.setLoaded(!0),this._availableImages=this.imageManager.listImages(),i&&(this._changed=!0),this.dispatcher.broadcast("setImages",this._availableImages),this.fire(new t.Event("data",{dataType:"style"})),s&&s(e);}));}_unloadSprite(){for(const t of Object.values(this._spritesImagesIds).flat())this.imageManager.removeImage(t),this._changedImages[t]=!0;this._spritesImagesIds={},this._availableImages=this.imageManager.listImages(),this._changed=!0,this.dispatcher.broadcast("setImages",this._availableImages),this.fire(new t.Event("data",{dataType:"style"}));}_validateLayer(e){const i=this.sourceCaches[e.source];if(!i)return;const s=e.sourceLayer;if(!s)return;const a=i.getSource();("geojson"===a.type||a.vectorLayerIds&&-1===a.vectorLayerIds.indexOf(s))&&this.fire(new t.ErrorEvent(new Error(`Source layer "${s}" does not exist on source "${a.id}" as specified by style layer "${e.id}".`)));}loaded(){if(!this._loaded)return !1;if(Object.keys(this._updatedSources).length)return !1;for(const t in this.sourceCaches)if(!this.sourceCaches[t].loaded())return !1;return !!this.imageManager.isLoaded()}_serializeByIds(t){const e=this._serializedAllLayers();if(!t||0===t.length)return Object.values(e);const i=[];for(const s of t)e[s]&&i.push(e[s]);return i}_serializedAllLayers(){let t=this._serializedLayers;if(t)return t;t=this._serializedLayers={};const e=Object.keys(this._layers);for(const i of e){const e=this._layers[i];"custom"!==e.type&&(t[i]=e.serialize());}return t}hasTransitions(){if(this.light&&this.light.hasTransition())return !0;for(const t in this.sourceCaches)if(this.sourceCaches[t].hasTransition())return !0;for(const t in this._layers)if(this._layers[t].hasTransition())return !0;return !1}_checkLoaded(){if(!this._loaded)throw new Error("Style is not done loading.")}update(e){if(!this._loaded)return;const i=this._changed;if(this._changed){const t=Object.keys(this._updatedLayers),i=Object.keys(this._removedLayers);(t.length||i.length)&&this._updateWorkerLayers(t,i);for(const t in this._updatedSources){const e=this._updatedSources[t];if("reload"===e)this._reloadSource(t);else {if("clear"!==e)throw new Error(`Invalid action ${e}`);this._clearSource(t);}}this._updateTilesForChangedImages(),this._updateTilesForChangedGlyphs();for(const t in this._updatedPaintProps)this._layers[t].updateTransitions(e);this.light.updateTransitions(e),this._resetUpdates();}const s={};for(const t in this.sourceCaches){const e=this.sourceCaches[t];s[t]=e.used,e.used=!1;}for(const t of this._order){const i=this._layers[t];i.recalculate(e,this._availableImages),!i.isHidden(e.zoom)&&i.source&&(this.sourceCaches[i.source].used=!0);}for(const e in s){const i=this.sourceCaches[e];s[e]!==i.used&&i.fire(new t.Event("data",{sourceDataType:"visibility",dataType:"source",sourceId:e}));}this.light.recalculate(e),this.z=e.zoom,i&&this.fire(new t.Event("data",{dataType:"style"}));}_updateTilesForChangedImages(){const t=Object.keys(this._changedImages);if(t.length){for(const e in this.sourceCaches)this.sourceCaches[e].reloadTilesForDependencies(["icons","patterns"],t);this._changedImages={};}}_updateTilesForChangedGlyphs(){if(this._glyphsDidChange){for(const t in this.sourceCaches)this.sourceCaches[t].reloadTilesForDependencies(["glyphs"],[""]);this._glyphsDidChange=!1;}}_updateWorkerLayers(t,e){this.dispatcher.broadcast("updateLayers",{layers:this._serializeByIds(t),removedIds:e});}_resetUpdates(){this._changed=!1,this._updatedLayers={},this._removedLayers={},this._updatedSources={},this._updatedPaintProps={},this._changedImages={},this._glyphsDidChange=!1;}setState(e,i={}){this._checkLoaded();const s=this.serialize();if(e=i.transformStyle?i.transformStyle(s,e):e,te(this,t.validateStyle(e)))return !1;(e=t.clone$1(e)).layers=t.derefLayers(e.layers);const a=t.diffStyles(s,e).filter((t=>!(t.command in ie)));if(0===a.length)return !1;const o=a.filter((t=>!(t.command in ee)));if(o.length>0)throw new Error(`Unimplemented: ${o.map((t=>t.command)).join(", ")}.`);for(const t of a)"setTransition"!==t.command&&this[t.command].apply(this,t.args);return this.stylesheet=e,!0}addImage(e,i){if(this.getImage(e))return this.fire(new t.ErrorEvent(new Error(`An image named "${e}" already exists.`)));this.imageManager.addImage(e,i),this._afterImageUpdated(e);}updateImage(t,e){this.imageManager.updateImage(t,e);}getImage(t){return this.imageManager.getImage(t)}removeImage(e){if(!this.getImage(e))return this.fire(new t.ErrorEvent(new Error(`An image named "${e}" does not exist.`)));this.imageManager.removeImage(e),this._afterImageUpdated(e);}_afterImageUpdated(e){this._availableImages=this.imageManager.listImages(),this._changedImages[e]=!0,this._changed=!0,this.dispatcher.broadcast("setImages",this._availableImages),this.fire(new t.Event("data",{dataType:"style"}));}listImages(){return this._checkLoaded(),this.imageManager.listImages()}addSource(e,i,s={}){if(this._checkLoaded(),void 0!==this.sourceCaches[e])throw new Error(`Source "${e}" already exists.`);if(!i.type)throw new Error(`The type property must be defined, but only the following properties were given: ${Object.keys(i).join(", ")}.`);if(["vector","raster","geojson","video","image"].indexOf(i.type)>=0&&this._validate(t.validateStyle.source,`sources.${e}`,i,null,s))return;this.map&&this.map._collectResourceTiming&&(i.collectResourceTiming=!0);const a=this.sourceCaches[e]=new Y(e,i,this.dispatcher);a.style=this,a.setEventedParent(this,(()=>({isSourceLoaded:a.loaded(),source:a.serialize(),sourceId:e}))),a.onAdd(this.map),this._changed=!0;}removeSource(e){if(this._checkLoaded(),void 0===this.sourceCaches[e])throw new Error("There is no source with this ID");for(const i in this._layers)if(this._layers[i].source===e)return this.fire(new t.ErrorEvent(new Error(`Source "${e}" cannot be removed while layer "${i}" is using it.`)));const i=this.sourceCaches[e];delete this.sourceCaches[e],delete this._updatedSources[e],i.fire(new t.Event("data",{sourceDataType:"metadata",dataType:"source",sourceId:e})),i.setEventedParent(null),i.onRemove(this.map),this._changed=!0;}setGeoJSONSourceData(t,e){if(this._checkLoaded(),void 0===this.sourceCaches[t])throw new Error(`There is no source with this ID=${t}`);const i=this.sourceCaches[t].getSource();if("geojson"!==i.type)throw new Error(`geojsonSource.type is ${i.type}, which is !== 'geojson`);i.setData(e),this._changed=!0;}getSource(t){return this.sourceCaches[t]&&this.sourceCaches[t].getSource()}addLayer(e,i,s={}){this._checkLoaded();const a=e.id;if(this.getLayer(a))return void this.fire(new t.ErrorEvent(new Error(`Layer "${a}" already exists on this map.`)));let o;if("custom"===e.type){if(te(this,t.validateCustomStyleLayer(e)))return;o=t.createStyleLayer(e);}else {if("source"in e&&"object"==typeof e.source&&(this.addSource(a,e.source),e=t.clone$1(e),e=t.extend(e,{source:a})),this._validate(t.validateStyle.layer,`layers.${a}`,e,{arrayIndex:-1},s))return;o=t.createStyleLayer(e),this._validateLayer(o),o.setEventedParent(this,{layer:{id:a}});}const r=i?this._order.indexOf(i):this._order.length;if(i&&-1===r)this.fire(new t.ErrorEvent(new Error(`Cannot add layer "${a}" before non-existing layer "${i}".`)));else {if(this._order.splice(r,0,a),this._layerOrderChanged=!0,this._layers[a]=o,this._removedLayers[a]&&o.source&&"custom"!==o.type){const t=this._removedLayers[a];delete this._removedLayers[a],t.type!==o.type?this._updatedSources[o.source]="clear":(this._updatedSources[o.source]="reload",this.sourceCaches[o.source].pause());}this._updateLayer(o),o.onAdd&&o.onAdd(this.map);}}moveLayer(e,i){if(this._checkLoaded(),this._changed=!0,!this._layers[e])return void this.fire(new t.ErrorEvent(new Error(`The layer '${e}' does not exist in the map's style and cannot be moved.`)));if(e===i)return;const s=this._order.indexOf(e);this._order.splice(s,1);const a=i?this._order.indexOf(i):this._order.length;i&&-1===a?this.fire(new t.ErrorEvent(new Error(`Cannot move layer "${e}" before non-existing layer "${i}".`))):(this._order.splice(a,0,e),this._layerOrderChanged=!0);}removeLayer(e){this._checkLoaded();const i=this._layers[e];if(!i)return void this.fire(new t.ErrorEvent(new Error(`Cannot remove non-existing layer "${e}".`)));i.setEventedParent(null);const s=this._order.indexOf(e);this._order.splice(s,1),this._layerOrderChanged=!0,this._changed=!0,this._removedLayers[e]=i,delete this._layers[e],this._serializedLayers&&delete this._serializedLayers[e],delete this._updatedLayers[e],delete this._updatedPaintProps[e],i.onRemove&&i.onRemove(this.map);}getLayer(t){return this._layers[t]}hasLayer(t){return t in this._layers}setLayerZoomRange(e,i,s){this._checkLoaded();const a=this.getLayer(e);a?a.minzoom===i&&a.maxzoom===s||(null!=i&&(a.minzoom=i),null!=s&&(a.maxzoom=s),this._updateLayer(a)):this.fire(new t.ErrorEvent(new Error(`Cannot set the zoom range of non-existing layer "${e}".`)));}setFilter(e,i,s={}){this._checkLoaded();const a=this.getLayer(e);if(a){if(!t.deepEqual(a.filter,i))return null==i?(a.filter=void 0,void this._updateLayer(a)):void(this._validate(t.validateStyle.filter,`layers.${a.id}.filter`,i,null,s)||(a.filter=t.clone$1(i),this._updateLayer(a)))}else this.fire(new t.ErrorEvent(new Error(`Cannot filter non-existing layer "${e}".`)));}getFilter(e){return t.clone$1(this.getLayer(e).filter)}setLayoutProperty(e,i,s,a={}){this._checkLoaded();const o=this.getLayer(e);o?t.deepEqual(o.getLayoutProperty(i),s)||(o.setLayoutProperty(i,s,a),this._updateLayer(o)):this.fire(new t.ErrorEvent(new Error(`Cannot style non-existing layer "${e}".`)));}getLayoutProperty(e,i){const s=this.getLayer(e);if(s)return s.getLayoutProperty(i);this.fire(new t.ErrorEvent(new Error(`Cannot get style of non-existing layer "${e}".`)));}setPaintProperty(e,i,s,a={}){this._checkLoaded();const o=this.getLayer(e);o?t.deepEqual(o.getPaintProperty(i),s)||(o.setPaintProperty(i,s,a)&&this._updateLayer(o),this._changed=!0,this._updatedPaintProps[e]=!0):this.fire(new t.ErrorEvent(new Error(`Cannot style non-existing layer "${e}".`)));}getPaintProperty(t,e){return this.getLayer(t).getPaintProperty(e)}setFeatureState(e,i){this._checkLoaded();const s=e.source,a=e.sourceLayer,o=this.sourceCaches[s];if(void 0===o)return void this.fire(new t.ErrorEvent(new Error(`The source '${s}' does not exist in the map's style.`)));const r=o.getSource().type;"geojson"===r&&a?this.fire(new t.ErrorEvent(new Error("GeoJSON sources cannot have a sourceLayer parameter."))):"vector"!==r||a?(void 0===e.id&&this.fire(new t.ErrorEvent(new Error("The feature id parameter must be provided."))),o.setFeatureState(a,e.id,i)):this.fire(new t.ErrorEvent(new Error("The sourceLayer parameter must be provided for vector source types.")));}removeFeatureState(e,i){this._checkLoaded();const s=e.source,a=this.sourceCaches[s];if(void 0===a)return void this.fire(new t.ErrorEvent(new Error(`The source '${s}' does not exist in the map's style.`)));const o=a.getSource().type,r="vector"===o?e.sourceLayer:void 0;"vector"!==o||r?i&&"string"!=typeof e.id&&"number"!=typeof e.id?this.fire(new t.ErrorEvent(new Error("A feature id is required to remove its specific state property."))):a.removeFeatureState(r,e.id,i):this.fire(new t.ErrorEvent(new Error("The sourceLayer parameter must be provided for vector source types.")));}getFeatureState(e){this._checkLoaded();const i=e.source,s=e.sourceLayer,a=this.sourceCaches[i];if(void 0!==a)return "vector"!==a.getSource().type||s?(void 0===e.id&&this.fire(new t.ErrorEvent(new Error("The feature id parameter must be provided."))),a.getFeatureState(s,e.id)):void this.fire(new t.ErrorEvent(new Error("The sourceLayer parameter must be provided for vector source types.")));this.fire(new t.ErrorEvent(new Error(`The source '${i}' does not exist in the map's style.`)));}getTransition(){return t.extend({duration:300,delay:0},this.stylesheet&&this.stylesheet.transition)}serialize(){if(!this._loaded)return;const e=t.mapObject(this.sourceCaches,(t=>t.serialize())),i=this._serializeByIds(this._order),s=this.stylesheet;return t.filterObject({version:s.version,name:s.name,metadata:s.metadata,light:s.light,center:s.center,zoom:s.zoom,bearing:s.bearing,pitch:s.pitch,sprite:s.sprite,glyphs:s.glyphs,transition:s.transition,sources:e,layers:i},(t=>void 0!==t))}_updateLayer(t){this._updatedLayers[t.id]=!0,t.source&&!this._updatedSources[t.source]&&"raster"!==this.sourceCaches[t.source].getSource().type&&(this._updatedSources[t.source]="reload",this.sourceCaches[t.source].pause()),this._serializedLayers=null,this._changed=!0;}_flattenAndSortRenderedFeatures(t){const e=t=>"fill-extrusion"===this._layers[t].type,i={},s=[];for(let a=this._order.length-1;a>=0;a--){const o=this._order[a];if(e(o)){i[o]=a;for(const e of t){const t=e[o];if(t)for(const e of t)s.push(e);}}}s.sort(((t,e)=>e.intersectionZ-t.intersectionZ));const a=[];for(let o=this._order.length-1;o>=0;o--){const r=this._order[o];if(e(r))for(let t=s.length-1;t>=0;t--){const e=s[t].feature;if(i[e.layer.id]<o)break;a.push(e),s.pop();}else for(const e of t){const t=e[r];if(t)for(const e of t)a.push(e.feature);}}return a}queryRenderedFeatures(e,i,s){i&&i.filter&&this._validate(t.validateStyle.filter,"queryRenderedFeatures.filter",i.filter,null,i);const a={};if(i&&i.layers){if(!Array.isArray(i.layers))return this.fire(new t.ErrorEvent(new Error("parameters.layers must be an Array."))),[];for(const e of i.layers){const i=this._layers[e];if(!i)return this.fire(new t.ErrorEvent(new Error(`The layer '${e}' does not exist in the map's style and cannot be queried for features.`))),[];a[i.source]=!0;}}const o=[];i.availableImages=this._availableImages;const r=this._serializedAllLayers();for(const t in this.sourceCaches)i.layers&&!a[t]||o.push($(this.sourceCaches[t],this._layers,r,e,i,s));return this.placement&&o.push(function(t,e,i,s,a,o,r){const n={},l=o.queryRenderedSymbols(s),c=[];for(const t of Object.keys(l).map(Number))c.push(r[t]);c.sort(X);for(const i of c){const s=i.featureIndex.lookupSymbolFeatures(l[i.bucketInstanceId],e,i.bucketIndex,i.sourceLayerIndex,a.filter,a.layers,a.availableImages,t);for(const t in s){const e=n[t]=n[t]||[],a=s[t];a.sort(((t,e)=>{const s=i.featureSortOrder;if(s){const i=s.indexOf(t.featureIndex);return s.indexOf(e.featureIndex)-i}return e.featureIndex-t.featureIndex}));for(const t of a)e.push(t);}}for(const e in n)n[e].forEach((s=>{const a=s.feature,o=i[t[e].source].getFeatureState(a.layer["source-layer"],a.id);a.source=a.layer.source,a.layer["source-layer"]&&(a.sourceLayer=a.layer["source-layer"]),a.state=o;}));return n}(this._layers,r,this.sourceCaches,e,i,this.placement.collisionIndex,this.placement.retainedQueryData)),this._flattenAndSortRenderedFeatures(o)}querySourceFeatures(e,i){i&&i.filter&&this._validate(t.validateStyle.filter,"querySourceFeatures.filter",i.filter,null,i);const s=this.sourceCaches[e];return s?function(t,e){const i=t.getRenderableIds().map((e=>t.getTileByID(e))),s=[],a={};for(let t=0;t<i.length;t++){const o=i[t],r=o.tileID.canonical.key;a[r]||(a[r]=!0,o.querySourceFeatures(s,e));}return s}(s,i):[]}addSourceType(t,e,i){return q(t)?i(new Error(`A source type called "${t}" already exists.`)):(((t,e)=>{V[t]=e;})(t,e),e.workerSourceURL?void this.dispatcher.broadcast("loadWorkerSource",{name:t,url:e.workerSourceURL},i):i(null,null))}getLight(){return this.light.getLight()}setLight(e,i={}){this._checkLoaded();const s=this.light.getLight();let a=!1;for(const i in e)if(!t.deepEqual(e[i],s[i])){a=!0;break}if(!a)return;const o={now:t.browser.now(),transition:t.extend({duration:300,delay:0},this.stylesheet.transition)};this.light.setLight(e,i),this.light.updateTransitions(o);}_validate(e,i,s,a,o={}){return (!o||!1!==o.validate)&&te(this,e.call(t.validateStyle,t.extend({key:i,style:this.serialize(),value:s,styleSpec:t.v8Spec},a)))}_remove(e=!0){this._request&&(this._request.cancel(),this._request=null),this._spriteRequest&&(this._spriteRequest.cancel(),this._spriteRequest=null),t.evented.off("pluginStateChange",this._rtlTextPluginCallback);for(const t in this._layers)this._layers[t].setEventedParent(null);for(const t in this.sourceCaches){const e=this.sourceCaches[t];e.setEventedParent(null),e.onRemove(this.map);}this.imageManager.setEventedParent(null),this.setEventedParent(null),this.dispatcher.remove(e);}_clearSource(t){this.sourceCaches[t].clearTiles();}_reloadSource(t){this.sourceCaches[t].resume(),this.sourceCaches[t].reload();}_updateSources(t){for(const e in this.sourceCaches)this.sourceCaches[e].update(t,this.map.terrain);}_generateCollisionBoxes(){for(const t in this.sourceCaches)this._reloadSource(t);}_updatePlacement(e,i,s,a,o=!1){let r=!1,n=!1;const l={};for(const t of this._order){const i=this._layers[t];if("symbol"!==i.type)continue;if(!l[i.source]){const t=this.sourceCaches[i.source];l[i.source]=t.getRenderableIds(!0).map((e=>t.getTileByID(e))).sort(((t,e)=>e.tileID.overscaledZ-t.tileID.overscaledZ||(t.tileID.isLessThan(e.tileID)?-1:1)));}const s=this.crossTileSymbolIndex.addLayer(i,l[i.source],e.center.lng);r=r||s;}if(this.crossTileSymbolIndex.pruneUnusedLayers(this._order),((o=o||this._layerOrderChanged||0===s)||!this.pauseablePlacement||this.pauseablePlacement.isDone()&&!this.placement.stillRecent(t.browser.now(),e.zoom))&&(this.pauseablePlacement=new Wt(e,this.map.terrain,this._order,o,i,s,a,this.placement),this._layerOrderChanged=!1),this.pauseablePlacement.isDone()?this.placement.setStale():(this.pauseablePlacement.continuePlacement(this._order,this._layers,l),this.pauseablePlacement.isDone()&&(this.placement=this.pauseablePlacement.commit(t.browser.now()),n=!0),r&&this.pauseablePlacement.placement.setStale()),n||r)for(const t of this._order){const e=this._layers[t];"symbol"===e.type&&this.placement.updateLayerOpacities(e,l[e.source]);}return !this.pauseablePlacement.isDone()||this.placement.hasTransitions(t.browser.now())}_releaseSymbolFadeTiles(){for(const t in this.sourceCaches)this.sourceCaches[t].releaseSymbolFadeTiles();}getImages(t,e,i){this.imageManager.getImages(e.icons,i),this._updateTilesForChangedImages();const s=this.sourceCaches[e.source];s&&s.setDependencies(e.tileID.key,e.type,e.icons);}getGlyphs(t,e,i){this.glyphManager.getGlyphs(e.stacks,i);const s=this.sourceCaches[e.source];s&&s.setDependencies(e.tileID.key,e.type,[""]);}getResource(e,i,s){return t.makeRequest(i,s)}getGlyphsUrl(){return this.stylesheet.glyphs||null}setGlyphs(e,i={}){this._checkLoaded(),e&&this._validate(t.validateStyle.glyphs,"glyphs",e,null,i)||(this._glyphsDidChange=!0,this.stylesheet.glyphs=e,this.glyphManager.entries={},this.glyphManager.setURL(e));}addSprite(e,i,s={},a){this._checkLoaded();const o=[{id:e,url:i}],r=[...g(this.stylesheet.sprite),...o];this._validate(t.validateStyle.sprite,"sprite",r,null,s)||(this.stylesheet.sprite=r,this._loadSprite(o,!0,a));}removeSprite(e){this._checkLoaded();const i=g(this.stylesheet.sprite);if(i.find((t=>t.id===e))){if(this._spritesImagesIds[e])for(const t of this._spritesImagesIds[e])this.imageManager.removeImage(t),this._changedImages[t]=!0;i.splice(i.findIndex((t=>t.id===e)),1),this.stylesheet.sprite=i.length>0?i:void 0,delete this._spritesImagesIds[e],this._availableImages=this.imageManager.listImages(),this._changed=!0,this.dispatcher.broadcast("setImages",this._availableImages),this.fire(new t.Event("data",{dataType:"style"}));}else this.fire(new t.ErrorEvent(new Error(`Sprite "${e}" doesn't exists on this map.`)));}getSprite(){return g(this.stylesheet.sprite)}setSprite(e,i={},s){this._checkLoaded(),e&&this._validate(t.validateStyle.sprite,"sprite",e,null,i)||(this.stylesheet.sprite=e,e?this._loadSprite(e,!0,s):(this._unloadSprite(),s&&s(null)));}}ae.registerForPluginStateChange=t.registerForPluginStateChange;var oe=t.createLayout([{name:"a_pos",type:"Int16",components:2}]),re="attribute vec3 a_pos3d;uniform mat4 u_matrix;uniform float u_ele_delta;varying vec2 v_texture_pos;varying float v_depth;void main() {float extent=8192.0;float ele_delta=a_pos3d.z==1.0 ? u_ele_delta : 0.0;v_texture_pos=a_pos3d.xy/extent;gl_Position=u_matrix*vec4(a_pos3d.xy,get_elevation(a_pos3d.xy)-ele_delta,1.0);v_depth=gl_Position.z/gl_Position.w;}";const ne={prelude:le("#ifdef GL_ES\nprecision mediump float;\n#else\n#if !defined(lowp)\n#define lowp\n#endif\n#if !defined(mediump)\n#define mediump\n#endif\n#if !defined(highp)\n#define highp\n#endif\n#endif\n","#ifdef GL_ES\nprecision highp float;\n#else\n#if !defined(lowp)\n#define lowp\n#endif\n#if !defined(mediump)\n#define mediump\n#endif\n#if !defined(highp)\n#define highp\n#endif\n#endif\nvec2 unpack_float(const float packedValue) {int packedIntValue=int(packedValue);int v0=packedIntValue/256;return vec2(v0,packedIntValue-v0*256);}vec2 unpack_opacity(const float packedOpacity) {int intOpacity=int(packedOpacity)/2;return vec2(float(intOpacity)/127.0,mod(packedOpacity,2.0));}vec4 decode_color(const vec2 encodedColor) {return vec4(unpack_float(encodedColor[0])/255.0,unpack_float(encodedColor[1])/255.0\n);}float unpack_mix_vec2(const vec2 packedValue,const float t) {return mix(packedValue[0],packedValue[1],t);}vec4 unpack_mix_color(const vec4 packedColors,const float t) {vec4 minColor=decode_color(vec2(packedColors[0],packedColors[1]));vec4 maxColor=decode_color(vec2(packedColors[2],packedColors[3]));return mix(minColor,maxColor,t);}vec2 get_pattern_pos(const vec2 pixel_coord_upper,const vec2 pixel_coord_lower,const vec2 pattern_size,const float tile_units_to_pixels,const vec2 pos) {vec2 offset=mod(mod(mod(pixel_coord_upper,pattern_size)*256.0,pattern_size)*256.0+pixel_coord_lower,pattern_size);return (tile_units_to_pixels*pos+offset)/pattern_size;}\n#ifdef TERRAIN3D\nuniform sampler2D u_terrain;uniform float u_terrain_dim;uniform mat4 u_terrain_matrix;uniform vec4 u_terrain_unpack;uniform float u_terrain_exaggeration;uniform highp sampler2D u_depth;\n#endif\nconst highp vec4 bitSh=vec4(256.*256.*256.,256.*256.,256.,1.);const highp vec4 bitShifts=vec4(1.)/bitSh;highp float unpack(highp vec4 color) {return dot(color,bitShifts);}highp float depthOpacity(vec3 frag) {\n#ifdef TERRAIN3D\nhighp float d=unpack(texture2D(u_depth,frag.xy*0.5+0.5))+0.0001-frag.z;return 1.0-max(0.0,min(1.0,-d*500.0));\n#else\nreturn 1.0;\n#endif\n}float calculate_visibility(vec4 pos) {\n#ifdef TERRAIN3D\nvec3 frag=pos.xyz/pos.w;highp float d=depthOpacity(frag);if (d > 0.95) return 1.0;return (d+depthOpacity(frag+vec3(0.0,0.01,0.0)))/2.0;\n#else\nreturn 1.0;\n#endif\n}float ele(vec2 pos) {\n#ifdef TERRAIN3D\nvec4 rgb=(texture2D(u_terrain,pos)*255.0)*u_terrain_unpack;return rgb.r+rgb.g+rgb.b-u_terrain_unpack.a;\n#else\nreturn 0.0;\n#endif\n}float get_elevation(vec2 pos) {\n#ifdef TERRAIN3D\nvec2 coord=(u_terrain_matrix*vec4(pos,0.0,1.0)).xy*u_terrain_dim+1.0;vec2 f=fract(coord);vec2 c=(floor(coord)+0.5)/(u_terrain_dim+2.0);float d=1.0/(u_terrain_dim+2.0);float tl=ele(c);float tr=ele(c+vec2(d,0.0));float bl=ele(c+vec2(0.0,d));float br=ele(c+vec2(d,d));float elevation=mix(mix(tl,tr,f.x),mix(bl,br,f.x),f.y);return elevation*u_terrain_exaggeration;\n#else\nreturn 0.0;\n#endif\n}"),background:le("uniform vec4 u_color;uniform float u_opacity;void main() {gl_FragColor=u_color*u_opacity;\n#ifdef OVERDRAW_INSPECTOR\ngl_FragColor=vec4(1.0);\n#endif\n}","attribute vec2 a_pos;uniform mat4 u_matrix;void main() {gl_Position=u_matrix*vec4(a_pos,0,1);}"),backgroundPattern:le("uniform vec2 u_pattern_tl_a;uniform vec2 u_pattern_br_a;uniform vec2 u_pattern_tl_b;uniform vec2 u_pattern_br_b;uniform vec2 u_texsize;uniform float u_mix;uniform float u_opacity;uniform sampler2D u_image;varying vec2 v_pos_a;varying vec2 v_pos_b;void main() {vec2 imagecoord=mod(v_pos_a,1.0);vec2 pos=mix(u_pattern_tl_a/u_texsize,u_pattern_br_a/u_texsize,imagecoord);vec4 color1=texture2D(u_image,pos);vec2 imagecoord_b=mod(v_pos_b,1.0);vec2 pos2=mix(u_pattern_tl_b/u_texsize,u_pattern_br_b/u_texsize,imagecoord_b);vec4 color2=texture2D(u_image,pos2);gl_FragColor=mix(color1,color2,u_mix)*u_opacity;\n#ifdef OVERDRAW_INSPECTOR\ngl_FragColor=vec4(1.0);\n#endif\n}","uniform mat4 u_matrix;uniform vec2 u_pattern_size_a;uniform vec2 u_pattern_size_b;uniform vec2 u_pixel_coord_upper;uniform vec2 u_pixel_coord_lower;uniform float u_scale_a;uniform float u_scale_b;uniform float u_tile_units_to_pixels;attribute vec2 a_pos;varying vec2 v_pos_a;varying vec2 v_pos_b;void main() {gl_Position=u_matrix*vec4(a_pos,0,1);v_pos_a=get_pattern_pos(u_pixel_coord_upper,u_pixel_coord_lower,u_scale_a*u_pattern_size_a,u_tile_units_to_pixels,a_pos);v_pos_b=get_pattern_pos(u_pixel_coord_upper,u_pixel_coord_lower,u_scale_b*u_pattern_size_b,u_tile_units_to_pixels,a_pos);}"),circle:le("varying vec3 v_data;varying float v_visibility;\n#pragma mapbox: define highp vec4 color\n#pragma mapbox: define mediump float radius\n#pragma mapbox: define lowp float blur\n#pragma mapbox: define lowp float opacity\n#pragma mapbox: define highp vec4 stroke_color\n#pragma mapbox: define mediump float stroke_width\n#pragma mapbox: define lowp float stroke_opacity\nvoid main() {\n#pragma mapbox: initialize highp vec4 color\n#pragma mapbox: initialize mediump float radius\n#pragma mapbox: initialize lowp float blur\n#pragma mapbox: initialize lowp float opacity\n#pragma mapbox: initialize highp vec4 stroke_color\n#pragma mapbox: initialize mediump float stroke_width\n#pragma mapbox: initialize lowp float stroke_opacity\nvec2 extrude=v_data.xy;float extrude_length=length(extrude);lowp float antialiasblur=v_data.z;float antialiased_blur=-max(blur,antialiasblur);float opacity_t=smoothstep(0.0,antialiased_blur,extrude_length-1.0);float color_t=stroke_width < 0.01 ? 0.0 : smoothstep(antialiased_blur,0.0,extrude_length-radius/(radius+stroke_width));gl_FragColor=v_visibility*opacity_t*mix(color*opacity,stroke_color*stroke_opacity,color_t);\n#ifdef OVERDRAW_INSPECTOR\ngl_FragColor=vec4(1.0);\n#endif\n}","uniform mat4 u_matrix;uniform bool u_scale_with_map;uniform bool u_pitch_with_map;uniform vec2 u_extrude_scale;uniform lowp float u_device_pixel_ratio;uniform highp float u_camera_to_center_distance;attribute vec2 a_pos;varying vec3 v_data;varying float v_visibility;\n#pragma mapbox: define highp vec4 color\n#pragma mapbox: define mediump float radius\n#pragma mapbox: define lowp float blur\n#pragma mapbox: define lowp float opacity\n#pragma mapbox: define highp vec4 stroke_color\n#pragma mapbox: define mediump float stroke_width\n#pragma mapbox: define lowp float stroke_opacity\nvoid main(void) {\n#pragma mapbox: initialize highp vec4 color\n#pragma mapbox: initialize mediump float radius\n#pragma mapbox: initialize lowp float blur\n#pragma mapbox: initialize lowp float opacity\n#pragma mapbox: initialize highp vec4 stroke_color\n#pragma mapbox: initialize mediump float stroke_width\n#pragma mapbox: initialize lowp float stroke_opacity\nvec2 extrude=vec2(mod(a_pos,2.0)*2.0-1.0);vec2 circle_center=floor(a_pos*0.5);float ele=get_elevation(circle_center);v_visibility=calculate_visibility(u_matrix*vec4(circle_center,ele,1.0));if (u_pitch_with_map) {vec2 corner_position=circle_center;if (u_scale_with_map) {corner_position+=extrude*(radius+stroke_width)*u_extrude_scale;} else {vec4 projected_center=u_matrix*vec4(circle_center,0,1);corner_position+=extrude*(radius+stroke_width)*u_extrude_scale*(projected_center.w/u_camera_to_center_distance);}gl_Position=u_matrix*vec4(corner_position,ele,1);} else {gl_Position=u_matrix*vec4(circle_center,ele,1);if (u_scale_with_map) {gl_Position.xy+=extrude*(radius+stroke_width)*u_extrude_scale*u_camera_to_center_distance;} else {gl_Position.xy+=extrude*(radius+stroke_width)*u_extrude_scale*gl_Position.w;}}lowp float antialiasblur=1.0/u_device_pixel_ratio/(radius+stroke_width);v_data=vec3(extrude.x,extrude.y,antialiasblur);}"),clippingMask:le("void main() {gl_FragColor=vec4(1.0);}","attribute vec2 a_pos;uniform mat4 u_matrix;void main() {gl_Position=u_matrix*vec4(a_pos,0,1);}"),heatmap:le("uniform highp float u_intensity;varying vec2 v_extrude;\n#pragma mapbox: define highp float weight\n#define GAUSS_COEF 0.3989422804014327\nvoid main() {\n#pragma mapbox: initialize highp float weight\nfloat d=-0.5*3.0*3.0*dot(v_extrude,v_extrude);float val=weight*u_intensity*GAUSS_COEF*exp(d);gl_FragColor=vec4(val,1.0,1.0,1.0);\n#ifdef OVERDRAW_INSPECTOR\ngl_FragColor=vec4(1.0);\n#endif\n}","uniform mat4 u_matrix;uniform float u_extrude_scale;uniform float u_opacity;uniform float u_intensity;attribute vec2 a_pos;varying vec2 v_extrude;\n#pragma mapbox: define highp float weight\n#pragma mapbox: define mediump float radius\nconst highp float ZERO=1.0/255.0/16.0;\n#define GAUSS_COEF 0.3989422804014327\nvoid main(void) {\n#pragma mapbox: initialize highp float weight\n#pragma mapbox: initialize mediump float radius\nvec2 unscaled_extrude=vec2(mod(a_pos,2.0)*2.0-1.0);float S=sqrt(-2.0*log(ZERO/weight/u_intensity/GAUSS_COEF))/3.0;v_extrude=S*unscaled_extrude;vec2 extrude=v_extrude*radius*u_extrude_scale;vec4 pos=vec4(floor(a_pos*0.5)+extrude,0,1);gl_Position=u_matrix*pos;}"),heatmapTexture:le("uniform sampler2D u_image;uniform sampler2D u_color_ramp;uniform float u_opacity;varying vec2 v_pos;void main() {float t=texture2D(u_image,v_pos).r;vec4 color=texture2D(u_color_ramp,vec2(t,0.5));gl_FragColor=color*u_opacity;\n#ifdef OVERDRAW_INSPECTOR\ngl_FragColor=vec4(0.0);\n#endif\n}","uniform mat4 u_matrix;uniform vec2 u_world;attribute vec2 a_pos;varying vec2 v_pos;void main() {gl_Position=u_matrix*vec4(a_pos*u_world,0,1);v_pos.x=a_pos.x;v_pos.y=1.0-a_pos.y;}"),collisionBox:le("varying float v_placed;varying float v_notUsed;void main() {float alpha=0.5;gl_FragColor=vec4(1.0,0.0,0.0,1.0)*alpha;if (v_placed > 0.5) {gl_FragColor=vec4(0.0,0.0,1.0,0.5)*alpha;}if (v_notUsed > 0.5) {gl_FragColor*=.1;}}","attribute vec2 a_pos;attribute vec2 a_anchor_pos;attribute vec2 a_extrude;attribute vec2 a_placed;attribute vec2 a_shift;uniform mat4 u_matrix;uniform vec2 u_extrude_scale;uniform float u_camera_to_center_distance;varying float v_placed;varying float v_notUsed;void main() {vec4 projectedPoint=u_matrix*vec4(a_anchor_pos,0,1);highp float camera_to_anchor_distance=projectedPoint.w;highp float collision_perspective_ratio=clamp(0.5+0.5*(u_camera_to_center_distance/camera_to_anchor_distance),0.0,4.0);gl_Position=u_matrix*vec4(a_pos,get_elevation(a_pos),1.0);gl_Position.xy+=(a_extrude+a_shift)*u_extrude_scale*gl_Position.w*collision_perspective_ratio;v_placed=a_placed.x;v_notUsed=a_placed.y;}"),collisionCircle:le("varying float v_radius;varying vec2 v_extrude;varying float v_perspective_ratio;varying float v_collision;void main() {float alpha=0.5*min(v_perspective_ratio,1.0);float stroke_radius=0.9*max(v_perspective_ratio,1.0);float distance_to_center=length(v_extrude);float distance_to_edge=abs(distance_to_center-v_radius);float opacity_t=smoothstep(-stroke_radius,0.0,-distance_to_edge);vec4 color=mix(vec4(0.0,0.0,1.0,0.5),vec4(1.0,0.0,0.0,1.0),v_collision);gl_FragColor=color*alpha*opacity_t;}","attribute vec2 a_pos;attribute float a_radius;attribute vec2 a_flags;uniform mat4 u_matrix;uniform mat4 u_inv_matrix;uniform vec2 u_viewport_size;uniform float u_camera_to_center_distance;varying float v_radius;varying vec2 v_extrude;varying float v_perspective_ratio;varying float v_collision;vec3 toTilePosition(vec2 screenPos) {vec4 rayStart=u_inv_matrix*vec4(screenPos,-1.0,1.0);vec4 rayEnd  =u_inv_matrix*vec4(screenPos, 1.0,1.0);rayStart.xyz/=rayStart.w;rayEnd.xyz  /=rayEnd.w;highp float t=(0.0-rayStart.z)/(rayEnd.z-rayStart.z);return mix(rayStart.xyz,rayEnd.xyz,t);}void main() {vec2 quadCenterPos=a_pos;float radius=a_radius;float collision=a_flags.x;float vertexIdx=a_flags.y;vec2 quadVertexOffset=vec2(mix(-1.0,1.0,float(vertexIdx >=2.0)),mix(-1.0,1.0,float(vertexIdx >=1.0 && vertexIdx <=2.0)));vec2 quadVertexExtent=quadVertexOffset*radius;vec3 tilePos=toTilePosition(quadCenterPos);vec4 clipPos=u_matrix*vec4(tilePos,1.0);highp float camera_to_anchor_distance=clipPos.w;highp float collision_perspective_ratio=clamp(0.5+0.5*(u_camera_to_center_distance/camera_to_anchor_distance),0.0,4.0);float padding_factor=1.2;v_radius=radius;v_extrude=quadVertexExtent*padding_factor;v_perspective_ratio=collision_perspective_ratio;v_collision=collision;gl_Position=vec4(clipPos.xyz/clipPos.w,1.0)+vec4(quadVertexExtent*padding_factor/u_viewport_size*2.0,0.0,0.0);}"),debug:le("uniform highp vec4 u_color;uniform sampler2D u_overlay;varying vec2 v_uv;void main() {vec4 overlay_color=texture2D(u_overlay,v_uv);gl_FragColor=mix(u_color,overlay_color,overlay_color.a);}","attribute vec2 a_pos;varying vec2 v_uv;uniform mat4 u_matrix;uniform float u_overlay_scale;void main() {v_uv=a_pos/8192.0;gl_Position=u_matrix*vec4(a_pos*u_overlay_scale,get_elevation(a_pos),1);}"),fill:le("#pragma mapbox: define highp vec4 color\n#pragma mapbox: define lowp float opacity\nvoid main() {\n#pragma mapbox: initialize highp vec4 color\n#pragma mapbox: initialize lowp float opacity\ngl_FragColor=color*opacity;\n#ifdef OVERDRAW_INSPECTOR\ngl_FragColor=vec4(1.0);\n#endif\n}","attribute vec2 a_pos;uniform mat4 u_matrix;\n#pragma mapbox: define highp vec4 color\n#pragma mapbox: define lowp float opacity\nvoid main() {\n#pragma mapbox: initialize highp vec4 color\n#pragma mapbox: initialize lowp float opacity\ngl_Position=u_matrix*vec4(a_pos,0,1);}"),fillOutline:le("varying vec2 v_pos;\n#pragma mapbox: define highp vec4 outline_color\n#pragma mapbox: define lowp float opacity\nvoid main() {\n#pragma mapbox: initialize highp vec4 outline_color\n#pragma mapbox: initialize lowp float opacity\nfloat dist=length(v_pos-gl_FragCoord.xy);float alpha=1.0-smoothstep(0.0,1.0,dist);gl_FragColor=outline_color*(alpha*opacity);\n#ifdef OVERDRAW_INSPECTOR\ngl_FragColor=vec4(1.0);\n#endif\n}","attribute vec2 a_pos;uniform mat4 u_matrix;uniform vec2 u_world;varying vec2 v_pos;\n#pragma mapbox: define highp vec4 outline_color\n#pragma mapbox: define lowp float opacity\nvoid main() {\n#pragma mapbox: initialize highp vec4 outline_color\n#pragma mapbox: initialize lowp float opacity\ngl_Position=u_matrix*vec4(a_pos,0,1);v_pos=(gl_Position.xy/gl_Position.w+1.0)/2.0*u_world;}"),fillOutlinePattern:le("uniform vec2 u_texsize;uniform sampler2D u_image;uniform float u_fade;varying vec2 v_pos_a;varying vec2 v_pos_b;varying vec2 v_pos;\n#pragma mapbox: define lowp float opacity\n#pragma mapbox: define lowp vec4 pattern_from\n#pragma mapbox: define lowp vec4 pattern_to\nvoid main() {\n#pragma mapbox: initialize lowp float opacity\n#pragma mapbox: initialize mediump vec4 pattern_from\n#pragma mapbox: initialize mediump vec4 pattern_to\nvec2 pattern_tl_a=pattern_from.xy;vec2 pattern_br_a=pattern_from.zw;vec2 pattern_tl_b=pattern_to.xy;vec2 pattern_br_b=pattern_to.zw;vec2 imagecoord=mod(v_pos_a,1.0);vec2 pos=mix(pattern_tl_a/u_texsize,pattern_br_a/u_texsize,imagecoord);vec4 color1=texture2D(u_image,pos);vec2 imagecoord_b=mod(v_pos_b,1.0);vec2 pos2=mix(pattern_tl_b/u_texsize,pattern_br_b/u_texsize,imagecoord_b);vec4 color2=texture2D(u_image,pos2);float dist=length(v_pos-gl_FragCoord.xy);float alpha=1.0-smoothstep(0.0,1.0,dist);gl_FragColor=mix(color1,color2,u_fade)*alpha*opacity;\n#ifdef OVERDRAW_INSPECTOR\ngl_FragColor=vec4(1.0);\n#endif\n}","uniform mat4 u_matrix;uniform vec2 u_world;uniform vec2 u_pixel_coord_upper;uniform vec2 u_pixel_coord_lower;uniform vec3 u_scale;attribute vec2 a_pos;varying vec2 v_pos_a;varying vec2 v_pos_b;varying vec2 v_pos;\n#pragma mapbox: define lowp float opacity\n#pragma mapbox: define lowp vec4 pattern_from\n#pragma mapbox: define lowp vec4 pattern_to\n#pragma mapbox: define lowp float pixel_ratio_from\n#pragma mapbox: define lowp float pixel_ratio_to\nvoid main() {\n#pragma mapbox: initialize lowp float opacity\n#pragma mapbox: initialize mediump vec4 pattern_from\n#pragma mapbox: initialize mediump vec4 pattern_to\n#pragma mapbox: initialize lowp float pixel_ratio_from\n#pragma mapbox: initialize lowp float pixel_ratio_to\nvec2 pattern_tl_a=pattern_from.xy;vec2 pattern_br_a=pattern_from.zw;vec2 pattern_tl_b=pattern_to.xy;vec2 pattern_br_b=pattern_to.zw;float tileRatio=u_scale.x;float fromScale=u_scale.y;float toScale=u_scale.z;gl_Position=u_matrix*vec4(a_pos,0,1);vec2 display_size_a=(pattern_br_a-pattern_tl_a)/pixel_ratio_from;vec2 display_size_b=(pattern_br_b-pattern_tl_b)/pixel_ratio_to;v_pos_a=get_pattern_pos(u_pixel_coord_upper,u_pixel_coord_lower,fromScale*display_size_a,tileRatio,a_pos);v_pos_b=get_pattern_pos(u_pixel_coord_upper,u_pixel_coord_lower,toScale*display_size_b,tileRatio,a_pos);v_pos=(gl_Position.xy/gl_Position.w+1.0)/2.0*u_world;}"),fillPattern:le("#ifdef GL_ES\nprecision highp float;\n#endif\nuniform vec2 u_texsize;uniform float u_fade;uniform sampler2D u_image;varying vec2 v_pos_a;varying vec2 v_pos_b;\n#pragma mapbox: define lowp float opacity\n#pragma mapbox: define lowp vec4 pattern_from\n#pragma mapbox: define lowp vec4 pattern_to\nvoid main() {\n#pragma mapbox: initialize lowp float opacity\n#pragma mapbox: initialize mediump vec4 pattern_from\n#pragma mapbox: initialize mediump vec4 pattern_to\nvec2 pattern_tl_a=pattern_from.xy;vec2 pattern_br_a=pattern_from.zw;vec2 pattern_tl_b=pattern_to.xy;vec2 pattern_br_b=pattern_to.zw;vec2 imagecoord=mod(v_pos_a,1.0);vec2 pos=mix(pattern_tl_a/u_texsize,pattern_br_a/u_texsize,imagecoord);vec4 color1=texture2D(u_image,pos);vec2 imagecoord_b=mod(v_pos_b,1.0);vec2 pos2=mix(pattern_tl_b/u_texsize,pattern_br_b/u_texsize,imagecoord_b);vec4 color2=texture2D(u_image,pos2);gl_FragColor=mix(color1,color2,u_fade)*opacity;\n#ifdef OVERDRAW_INSPECTOR\ngl_FragColor=vec4(1.0);\n#endif\n}","uniform mat4 u_matrix;uniform vec2 u_pixel_coord_upper;uniform vec2 u_pixel_coord_lower;uniform vec3 u_scale;attribute vec2 a_pos;varying vec2 v_pos_a;varying vec2 v_pos_b;\n#pragma mapbox: define lowp float opacity\n#pragma mapbox: define lowp vec4 pattern_from\n#pragma mapbox: define lowp vec4 pattern_to\n#pragma mapbox: define lowp float pixel_ratio_from\n#pragma mapbox: define lowp float pixel_ratio_to\nvoid main() {\n#pragma mapbox: initialize lowp float opacity\n#pragma mapbox: initialize mediump vec4 pattern_from\n#pragma mapbox: initialize mediump vec4 pattern_to\n#pragma mapbox: initialize lowp float pixel_ratio_from\n#pragma mapbox: initialize lowp float pixel_ratio_to\nvec2 pattern_tl_a=pattern_from.xy;vec2 pattern_br_a=pattern_from.zw;vec2 pattern_tl_b=pattern_to.xy;vec2 pattern_br_b=pattern_to.zw;float tileZoomRatio=u_scale.x;float fromScale=u_scale.y;float toScale=u_scale.z;vec2 display_size_a=(pattern_br_a-pattern_tl_a)/pixel_ratio_from;vec2 display_size_b=(pattern_br_b-pattern_tl_b)/pixel_ratio_to;gl_Position=u_matrix*vec4(a_pos,0,1);v_pos_a=get_pattern_pos(u_pixel_coord_upper,u_pixel_coord_lower,fromScale*display_size_a,tileZoomRatio,a_pos);v_pos_b=get_pattern_pos(u_pixel_coord_upper,u_pixel_coord_lower,toScale*display_size_b,tileZoomRatio,a_pos);}"),fillExtrusion:le("varying vec4 v_color;void main() {gl_FragColor=v_color;\n#ifdef OVERDRAW_INSPECTOR\ngl_FragColor=vec4(1.0);\n#endif\n}","uniform mat4 u_matrix;uniform vec3 u_lightcolor;uniform lowp vec3 u_lightpos;uniform lowp float u_lightintensity;uniform float u_vertical_gradient;uniform lowp float u_opacity;attribute vec2 a_pos;attribute vec4 a_normal_ed;\n#ifdef TERRAIN3D\nattribute vec2 a_centroid;\n#endif\nvarying vec4 v_color;\n#pragma mapbox: define highp float base\n#pragma mapbox: define highp float height\n#pragma mapbox: define highp vec4 color\nvoid main() {\n#pragma mapbox: initialize highp float base\n#pragma mapbox: initialize highp float height\n#pragma mapbox: initialize highp vec4 color\nvec3 normal=a_normal_ed.xyz;\n#ifdef TERRAIN3D\nfloat height_terrain3d_offset=get_elevation(a_centroid);float base_terrain3d_offset=height_terrain3d_offset-(base > 0.0 ? 0.0 : 10.0);\n#else\nfloat height_terrain3d_offset=0.0;float base_terrain3d_offset=0.0;\n#endif\nbase=max(0.0,base)+base_terrain3d_offset;height=max(0.0,height)+height_terrain3d_offset;float t=mod(normal.x,2.0);gl_Position=u_matrix*vec4(a_pos,t > 0.0 ? height : base,1);float colorvalue=color.r*0.2126+color.g*0.7152+color.b*0.0722;v_color=vec4(0.0,0.0,0.0,1.0);vec4 ambientlight=vec4(0.03,0.03,0.03,1.0);color+=ambientlight;float directional=clamp(dot(normal/16384.0,u_lightpos),0.0,1.0);directional=mix((1.0-u_lightintensity),max((1.0-colorvalue+u_lightintensity),1.0),directional);if (normal.y !=0.0) {directional*=((1.0-u_vertical_gradient)+(u_vertical_gradient*clamp((t+base)*pow(height/150.0,0.5),mix(0.7,0.98,1.0-u_lightintensity),1.0)));}v_color.r+=clamp(color.r*directional*u_lightcolor.r,mix(0.0,0.3,1.0-u_lightcolor.r),1.0);v_color.g+=clamp(color.g*directional*u_lightcolor.g,mix(0.0,0.3,1.0-u_lightcolor.g),1.0);v_color.b+=clamp(color.b*directional*u_lightcolor.b,mix(0.0,0.3,1.0-u_lightcolor.b),1.0);v_color*=u_opacity;}"),fillExtrusionPattern:le("uniform vec2 u_texsize;uniform float u_fade;uniform sampler2D u_image;varying vec2 v_pos_a;varying vec2 v_pos_b;varying vec4 v_lighting;\n#pragma mapbox: define lowp float base\n#pragma mapbox: define lowp float height\n#pragma mapbox: define lowp vec4 pattern_from\n#pragma mapbox: define lowp vec4 pattern_to\n#pragma mapbox: define lowp float pixel_ratio_from\n#pragma mapbox: define lowp float pixel_ratio_to\nvoid main() {\n#pragma mapbox: initialize lowp float base\n#pragma mapbox: initialize lowp float height\n#pragma mapbox: initialize mediump vec4 pattern_from\n#pragma mapbox: initialize mediump vec4 pattern_to\n#pragma mapbox: initialize lowp float pixel_ratio_from\n#pragma mapbox: initialize lowp float pixel_ratio_to\nvec2 pattern_tl_a=pattern_from.xy;vec2 pattern_br_a=pattern_from.zw;vec2 pattern_tl_b=pattern_to.xy;vec2 pattern_br_b=pattern_to.zw;vec2 imagecoord=mod(v_pos_a,1.0);vec2 pos=mix(pattern_tl_a/u_texsize,pattern_br_a/u_texsize,imagecoord);vec4 color1=texture2D(u_image,pos);vec2 imagecoord_b=mod(v_pos_b,1.0);vec2 pos2=mix(pattern_tl_b/u_texsize,pattern_br_b/u_texsize,imagecoord_b);vec4 color2=texture2D(u_image,pos2);vec4 mixedColor=mix(color1,color2,u_fade);gl_FragColor=mixedColor*v_lighting;\n#ifdef OVERDRAW_INSPECTOR\ngl_FragColor=vec4(1.0);\n#endif\n}","uniform mat4 u_matrix;uniform vec2 u_pixel_coord_upper;uniform vec2 u_pixel_coord_lower;uniform float u_height_factor;uniform vec3 u_scale;uniform float u_vertical_gradient;uniform lowp float u_opacity;uniform vec3 u_lightcolor;uniform lowp vec3 u_lightpos;uniform lowp float u_lightintensity;attribute vec2 a_pos;attribute vec4 a_normal_ed;\n#ifdef TERRAIN3D\nattribute vec2 a_centroid;\n#endif\nvarying vec2 v_pos_a;varying vec2 v_pos_b;varying vec4 v_lighting;\n#pragma mapbox: define lowp float base\n#pragma mapbox: define lowp float height\n#pragma mapbox: define lowp vec4 pattern_from\n#pragma mapbox: define lowp vec4 pattern_to\n#pragma mapbox: define lowp float pixel_ratio_from\n#pragma mapbox: define lowp float pixel_ratio_to\nvoid main() {\n#pragma mapbox: initialize lowp float base\n#pragma mapbox: initialize lowp float height\n#pragma mapbox: initialize mediump vec4 pattern_from\n#pragma mapbox: initialize mediump vec4 pattern_to\n#pragma mapbox: initialize lowp float pixel_ratio_from\n#pragma mapbox: initialize lowp float pixel_ratio_to\nvec2 pattern_tl_a=pattern_from.xy;vec2 pattern_br_a=pattern_from.zw;vec2 pattern_tl_b=pattern_to.xy;vec2 pattern_br_b=pattern_to.zw;float tileRatio=u_scale.x;float fromScale=u_scale.y;float toScale=u_scale.z;vec3 normal=a_normal_ed.xyz;float edgedistance=a_normal_ed.w;vec2 display_size_a=(pattern_br_a-pattern_tl_a)/pixel_ratio_from;vec2 display_size_b=(pattern_br_b-pattern_tl_b)/pixel_ratio_to;\n#ifdef TERRAIN3D\nfloat height_terrain3d_offset=get_elevation(a_centroid);float base_terrain3d_offset=height_terrain3d_offset-(base > 0.0 ? 0.0 : 10.0);\n#else\nfloat height_terrain3d_offset=0.0;float base_terrain3d_offset=0.0;\n#endif\nbase=max(0.0,base)+base_terrain3d_offset;height=max(0.0,height)+height_terrain3d_offset;float t=mod(normal.x,2.0);float z=t > 0.0 ? height : base;gl_Position=u_matrix*vec4(a_pos,z,1);vec2 pos=normal.x==1.0 && normal.y==0.0 && normal.z==16384.0\n? a_pos\n: vec2(edgedistance,z*u_height_factor);v_pos_a=get_pattern_pos(u_pixel_coord_upper,u_pixel_coord_lower,fromScale*display_size_a,tileRatio,pos);v_pos_b=get_pattern_pos(u_pixel_coord_upper,u_pixel_coord_lower,toScale*display_size_b,tileRatio,pos);v_lighting=vec4(0.0,0.0,0.0,1.0);float directional=clamp(dot(normal/16383.0,u_lightpos),0.0,1.0);directional=mix((1.0-u_lightintensity),max((0.5+u_lightintensity),1.0),directional);if (normal.y !=0.0) {directional*=((1.0-u_vertical_gradient)+(u_vertical_gradient*clamp((t+base)*pow(height/150.0,0.5),mix(0.7,0.98,1.0-u_lightintensity),1.0)));}v_lighting.rgb+=clamp(directional*u_lightcolor,mix(vec3(0.0),vec3(0.3),1.0-u_lightcolor),vec3(1.0));v_lighting*=u_opacity;}"),hillshadePrepare:le("#ifdef GL_ES\nprecision highp float;\n#endif\nuniform sampler2D u_image;varying vec2 v_pos;uniform vec2 u_dimension;uniform float u_zoom;uniform vec4 u_unpack;float getElevation(vec2 coord,float bias) {vec4 data=texture2D(u_image,coord)*255.0;data.a=-1.0;return dot(data,u_unpack)/4.0;}void main() {vec2 epsilon=1.0/u_dimension;float a=getElevation(v_pos+vec2(-epsilon.x,-epsilon.y),0.0);float b=getElevation(v_pos+vec2(0,-epsilon.y),0.0);float c=getElevation(v_pos+vec2(epsilon.x,-epsilon.y),0.0);float d=getElevation(v_pos+vec2(-epsilon.x,0),0.0);float e=getElevation(v_pos,0.0);float f=getElevation(v_pos+vec2(epsilon.x,0),0.0);float g=getElevation(v_pos+vec2(-epsilon.x,epsilon.y),0.0);float h=getElevation(v_pos+vec2(0,epsilon.y),0.0);float i=getElevation(v_pos+vec2(epsilon.x,epsilon.y),0.0);float exaggerationFactor=u_zoom < 2.0 ? 0.4 : u_zoom < 4.5 ? 0.35 : 0.3;float exaggeration=u_zoom < 15.0 ? (u_zoom-15.0)*exaggerationFactor : 0.0;vec2 deriv=vec2((c+f+f+i)-(a+d+d+g),(g+h+h+i)-(a+b+b+c))/pow(2.0,exaggeration+(19.2562-u_zoom));gl_FragColor=clamp(vec4(deriv.x/2.0+0.5,deriv.y/2.0+0.5,1.0,1.0),0.0,1.0);\n#ifdef OVERDRAW_INSPECTOR\ngl_FragColor=vec4(1.0);\n#endif\n}","uniform mat4 u_matrix;uniform vec2 u_dimension;attribute vec2 a_pos;attribute vec2 a_texture_pos;varying vec2 v_pos;void main() {gl_Position=u_matrix*vec4(a_pos,0,1);highp vec2 epsilon=1.0/u_dimension;float scale=(u_dimension.x-2.0)/u_dimension.x;v_pos=(a_texture_pos/8192.0)*scale+epsilon;}"),hillshade:le("uniform sampler2D u_image;varying vec2 v_pos;uniform vec2 u_latrange;uniform vec2 u_light;uniform vec4 u_shadow;uniform vec4 u_highlight;uniform vec4 u_accent;\n#define PI 3.141592653589793\nvoid main() {vec4 pixel=texture2D(u_image,v_pos);vec2 deriv=((pixel.rg*2.0)-1.0);float scaleFactor=cos(radians((u_latrange[0]-u_latrange[1])*(1.0-v_pos.y)+u_latrange[1]));float slope=atan(1.25*length(deriv)/scaleFactor);float aspect=deriv.x !=0.0 ? atan(deriv.y,-deriv.x) : PI/2.0*(deriv.y > 0.0 ? 1.0 :-1.0);float intensity=u_light.x;float azimuth=u_light.y+PI;float base=1.875-intensity*1.75;float maxValue=0.5*PI;float scaledSlope=intensity !=0.5 ? ((pow(base,slope)-1.0)/(pow(base,maxValue)-1.0))*maxValue : slope;float accent=cos(scaledSlope);vec4 accent_color=(1.0-accent)*u_accent*clamp(intensity*2.0,0.0,1.0);float shade=abs(mod((aspect+azimuth)/PI+0.5,2.0)-1.0);vec4 shade_color=mix(u_shadow,u_highlight,shade)*sin(scaledSlope)*clamp(intensity*2.0,0.0,1.0);gl_FragColor=accent_color*(1.0-shade_color.a)+shade_color;\n#ifdef OVERDRAW_INSPECTOR\ngl_FragColor=vec4(1.0);\n#endif\n}","uniform mat4 u_matrix;attribute vec2 a_pos;attribute vec2 a_texture_pos;varying vec2 v_pos;void main() {gl_Position=u_matrix*vec4(a_pos,0,1);v_pos=a_texture_pos/8192.0;}"),line:le("uniform lowp float u_device_pixel_ratio;varying vec2 v_width2;varying vec2 v_normal;varying float v_gamma_scale;\n#pragma mapbox: define highp vec4 color\n#pragma mapbox: define lowp float blur\n#pragma mapbox: define lowp float opacity\nvoid main() {\n#pragma mapbox: initialize highp vec4 color\n#pragma mapbox: initialize lowp float blur\n#pragma mapbox: initialize lowp float opacity\nfloat dist=length(v_normal)*v_width2.s;float blur2=(blur+1.0/u_device_pixel_ratio)*v_gamma_scale;float alpha=clamp(min(dist-(v_width2.t-blur2),v_width2.s-dist)/blur2,0.0,1.0);gl_FragColor=color*(alpha*opacity);\n#ifdef OVERDRAW_INSPECTOR\ngl_FragColor=vec4(1.0);\n#endif\n}","\n#define scale 0.015873016\nattribute vec2 a_pos_normal;attribute vec4 a_data;uniform mat4 u_matrix;uniform mediump float u_ratio;uniform vec2 u_units_to_pixels;uniform lowp float u_device_pixel_ratio;varying vec2 v_normal;varying vec2 v_width2;varying float v_gamma_scale;varying highp float v_linesofar;\n#pragma mapbox: define highp vec4 color\n#pragma mapbox: define lowp float blur\n#pragma mapbox: define lowp float opacity\n#pragma mapbox: define mediump float gapwidth\n#pragma mapbox: define lowp float offset\n#pragma mapbox: define mediump float width\nvoid main() {\n#pragma mapbox: initialize highp vec4 color\n#pragma mapbox: initialize lowp float blur\n#pragma mapbox: initialize lowp float opacity\n#pragma mapbox: initialize mediump float gapwidth\n#pragma mapbox: initialize lowp float offset\n#pragma mapbox: initialize mediump float width\nfloat ANTIALIASING=1.0/u_device_pixel_ratio/2.0;vec2 a_extrude=a_data.xy-128.0;float a_direction=mod(a_data.z,4.0)-1.0;v_linesofar=(floor(a_data.z/4.0)+a_data.w*64.0)*2.0;vec2 pos=floor(a_pos_normal*0.5);mediump vec2 normal=a_pos_normal-2.0*pos;normal.y=normal.y*2.0-1.0;v_normal=normal;gapwidth=gapwidth/2.0;float halfwidth=width/2.0;offset=-1.0*offset;float inset=gapwidth+(gapwidth > 0.0 ? ANTIALIASING : 0.0);float outset=gapwidth+halfwidth*(gapwidth > 0.0 ? 2.0 : 1.0)+(halfwidth==0.0 ? 0.0 : ANTIALIASING);mediump vec2 dist=outset*a_extrude*scale;mediump float u=0.5*a_direction;mediump float t=1.0-abs(u);mediump vec2 offset2=offset*a_extrude*scale*normal.y*mat2(t,-u,u,t);vec4 projected_extrude=u_matrix*vec4(dist/u_ratio,0.0,0.0);gl_Position=u_matrix*vec4(pos+offset2/u_ratio,0.0,1.0)+projected_extrude;\n#ifdef TERRAIN3D\nv_gamma_scale=1.0;\n#else\nfloat extrude_length_without_perspective=length(dist);float extrude_length_with_perspective=length(projected_extrude.xy/gl_Position.w*u_units_to_pixels);v_gamma_scale=extrude_length_without_perspective/extrude_length_with_perspective;\n#endif\nv_width2=vec2(outset,inset);}"),lineGradient:le("uniform lowp float u_device_pixel_ratio;uniform sampler2D u_image;varying vec2 v_width2;varying vec2 v_normal;varying float v_gamma_scale;varying highp vec2 v_uv;\n#pragma mapbox: define lowp float blur\n#pragma mapbox: define lowp float opacity\nvoid main() {\n#pragma mapbox: initialize lowp float blur\n#pragma mapbox: initialize lowp float opacity\nfloat dist=length(v_normal)*v_width2.s;float blur2=(blur+1.0/u_device_pixel_ratio)*v_gamma_scale;float alpha=clamp(min(dist-(v_width2.t-blur2),v_width2.s-dist)/blur2,0.0,1.0);vec4 color=texture2D(u_image,v_uv);gl_FragColor=color*(alpha*opacity);\n#ifdef OVERDRAW_INSPECTOR\ngl_FragColor=vec4(1.0);\n#endif\n}","\n#define scale 0.015873016\nattribute vec2 a_pos_normal;attribute vec4 a_data;attribute float a_uv_x;attribute float a_split_index;uniform mat4 u_matrix;uniform mediump float u_ratio;uniform lowp float u_device_pixel_ratio;uniform vec2 u_units_to_pixels;uniform float u_image_height;varying vec2 v_normal;varying vec2 v_width2;varying float v_gamma_scale;varying highp vec2 v_uv;\n#pragma mapbox: define lowp float blur\n#pragma mapbox: define lowp float opacity\n#pragma mapbox: define mediump float gapwidth\n#pragma mapbox: define lowp float offset\n#pragma mapbox: define mediump float width\nvoid main() {\n#pragma mapbox: initialize lowp float blur\n#pragma mapbox: initialize lowp float opacity\n#pragma mapbox: initialize mediump float gapwidth\n#pragma mapbox: initialize lowp float offset\n#pragma mapbox: initialize mediump float width\nfloat ANTIALIASING=1.0/u_device_pixel_ratio/2.0;vec2 a_extrude=a_data.xy-128.0;float a_direction=mod(a_data.z,4.0)-1.0;highp float texel_height=1.0/u_image_height;highp float half_texel_height=0.5*texel_height;v_uv=vec2(a_uv_x,a_split_index*texel_height-half_texel_height);vec2 pos=floor(a_pos_normal*0.5);mediump vec2 normal=a_pos_normal-2.0*pos;normal.y=normal.y*2.0-1.0;v_normal=normal;gapwidth=gapwidth/2.0;float halfwidth=width/2.0;offset=-1.0*offset;float inset=gapwidth+(gapwidth > 0.0 ? ANTIALIASING : 0.0);float outset=gapwidth+halfwidth*(gapwidth > 0.0 ? 2.0 : 1.0)+(halfwidth==0.0 ? 0.0 : ANTIALIASING);mediump vec2 dist=outset*a_extrude*scale;mediump float u=0.5*a_direction;mediump float t=1.0-abs(u);mediump vec2 offset2=offset*a_extrude*scale*normal.y*mat2(t,-u,u,t);vec4 projected_extrude=u_matrix*vec4(dist/u_ratio,0.0,0.0);gl_Position=u_matrix*vec4(pos+offset2/u_ratio,0.0,1.0)+projected_extrude;\n#ifdef TERRAIN3D\nv_gamma_scale=1.0;\n#else\nfloat extrude_length_without_perspective=length(dist);float extrude_length_with_perspective=length(projected_extrude.xy/gl_Position.w*u_units_to_pixels);v_gamma_scale=extrude_length_without_perspective/extrude_length_with_perspective;\n#endif\nv_width2=vec2(outset,inset);}"),linePattern:le("#ifdef GL_ES\nprecision highp float;\n#endif\nuniform lowp float u_device_pixel_ratio;uniform vec2 u_texsize;uniform float u_fade;uniform mediump vec3 u_scale;uniform sampler2D u_image;varying vec2 v_normal;varying vec2 v_width2;varying float v_linesofar;varying float v_gamma_scale;varying float v_width;\n#pragma mapbox: define lowp vec4 pattern_from\n#pragma mapbox: define lowp vec4 pattern_to\n#pragma mapbox: define lowp float pixel_ratio_from\n#pragma mapbox: define lowp float pixel_ratio_to\n#pragma mapbox: define lowp float blur\n#pragma mapbox: define lowp float opacity\nvoid main() {\n#pragma mapbox: initialize mediump vec4 pattern_from\n#pragma mapbox: initialize mediump vec4 pattern_to\n#pragma mapbox: initialize lowp float pixel_ratio_from\n#pragma mapbox: initialize lowp float pixel_ratio_to\n#pragma mapbox: initialize lowp float blur\n#pragma mapbox: initialize lowp float opacity\nvec2 pattern_tl_a=pattern_from.xy;vec2 pattern_br_a=pattern_from.zw;vec2 pattern_tl_b=pattern_to.xy;vec2 pattern_br_b=pattern_to.zw;float tileZoomRatio=u_scale.x;float fromScale=u_scale.y;float toScale=u_scale.z;vec2 display_size_a=(pattern_br_a-pattern_tl_a)/pixel_ratio_from;vec2 display_size_b=(pattern_br_b-pattern_tl_b)/pixel_ratio_to;vec2 pattern_size_a=vec2(display_size_a.x*fromScale/tileZoomRatio,display_size_a.y);vec2 pattern_size_b=vec2(display_size_b.x*toScale/tileZoomRatio,display_size_b.y);float aspect_a=display_size_a.y/v_width;float aspect_b=display_size_b.y/v_width;float dist=length(v_normal)*v_width2.s;float blur2=(blur+1.0/u_device_pixel_ratio)*v_gamma_scale;float alpha=clamp(min(dist-(v_width2.t-blur2),v_width2.s-dist)/blur2,0.0,1.0);float x_a=mod(v_linesofar/pattern_size_a.x*aspect_a,1.0);float x_b=mod(v_linesofar/pattern_size_b.x*aspect_b,1.0);float y=0.5*v_normal.y+0.5;vec2 texel_size=1.0/u_texsize;vec2 pos_a=mix(pattern_tl_a*texel_size-texel_size,pattern_br_a*texel_size+texel_size,vec2(x_a,y));vec2 pos_b=mix(pattern_tl_b*texel_size-texel_size,pattern_br_b*texel_size+texel_size,vec2(x_b,y));vec4 color=mix(texture2D(u_image,pos_a),texture2D(u_image,pos_b),u_fade);gl_FragColor=color*alpha*opacity;\n#ifdef OVERDRAW_INSPECTOR\ngl_FragColor=vec4(1.0);\n#endif\n}","\n#define scale 0.015873016\n#define LINE_DISTANCE_SCALE 2.0\nattribute vec2 a_pos_normal;attribute vec4 a_data;uniform mat4 u_matrix;uniform vec2 u_units_to_pixels;uniform mediump float u_ratio;uniform lowp float u_device_pixel_ratio;varying vec2 v_normal;varying vec2 v_width2;varying float v_linesofar;varying float v_gamma_scale;varying float v_width;\n#pragma mapbox: define lowp float blur\n#pragma mapbox: define lowp float opacity\n#pragma mapbox: define lowp float offset\n#pragma mapbox: define mediump float gapwidth\n#pragma mapbox: define mediump float width\n#pragma mapbox: define lowp float floorwidth\n#pragma mapbox: define lowp vec4 pattern_from\n#pragma mapbox: define lowp vec4 pattern_to\n#pragma mapbox: define lowp float pixel_ratio_from\n#pragma mapbox: define lowp float pixel_ratio_to\nvoid main() {\n#pragma mapbox: initialize lowp float blur\n#pragma mapbox: initialize lowp float opacity\n#pragma mapbox: initialize lowp float offset\n#pragma mapbox: initialize mediump float gapwidth\n#pragma mapbox: initialize mediump float width\n#pragma mapbox: initialize lowp float floorwidth\n#pragma mapbox: initialize mediump vec4 pattern_from\n#pragma mapbox: initialize mediump vec4 pattern_to\n#pragma mapbox: initialize lowp float pixel_ratio_from\n#pragma mapbox: initialize lowp float pixel_ratio_to\nfloat ANTIALIASING=1.0/u_device_pixel_ratio/2.0;vec2 a_extrude=a_data.xy-128.0;float a_direction=mod(a_data.z,4.0)-1.0;float a_linesofar=(floor(a_data.z/4.0)+a_data.w*64.0)*LINE_DISTANCE_SCALE;vec2 pos=floor(a_pos_normal*0.5);mediump vec2 normal=a_pos_normal-2.0*pos;normal.y=normal.y*2.0-1.0;v_normal=normal;gapwidth=gapwidth/2.0;float halfwidth=width/2.0;offset=-1.0*offset;float inset=gapwidth+(gapwidth > 0.0 ? ANTIALIASING : 0.0);float outset=gapwidth+halfwidth*(gapwidth > 0.0 ? 2.0 : 1.0)+(halfwidth==0.0 ? 0.0 : ANTIALIASING);mediump vec2 dist=outset*a_extrude*scale;mediump float u=0.5*a_direction;mediump float t=1.0-abs(u);mediump vec2 offset2=offset*a_extrude*scale*normal.y*mat2(t,-u,u,t);vec4 projected_extrude=u_matrix*vec4(dist/u_ratio,0.0,0.0);gl_Position=u_matrix*vec4(pos+offset2/u_ratio,0.0,1.0)+projected_extrude;\n#ifdef TERRAIN3D\nv_gamma_scale=1.0;\n#else\nfloat extrude_length_without_perspective=length(dist);float extrude_length_with_perspective=length(projected_extrude.xy/gl_Position.w*u_units_to_pixels);v_gamma_scale=extrude_length_without_perspective/extrude_length_with_perspective;\n#endif\nv_linesofar=a_linesofar;v_width2=vec2(outset,inset);v_width=floorwidth;}"),lineSDF:le("uniform lowp float u_device_pixel_ratio;uniform sampler2D u_image;uniform float u_sdfgamma;uniform float u_mix;varying vec2 v_normal;varying vec2 v_width2;varying vec2 v_tex_a;varying vec2 v_tex_b;varying float v_gamma_scale;\n#pragma mapbox: define highp vec4 color\n#pragma mapbox: define lowp float blur\n#pragma mapbox: define lowp float opacity\n#pragma mapbox: define mediump float width\n#pragma mapbox: define lowp float floorwidth\nvoid main() {\n#pragma mapbox: initialize highp vec4 color\n#pragma mapbox: initialize lowp float blur\n#pragma mapbox: initialize lowp float opacity\n#pragma mapbox: initialize mediump float width\n#pragma mapbox: initialize lowp float floorwidth\nfloat dist=length(v_normal)*v_width2.s;float blur2=(blur+1.0/u_device_pixel_ratio)*v_gamma_scale;float alpha=clamp(min(dist-(v_width2.t-blur2),v_width2.s-dist)/blur2,0.0,1.0);float sdfdist_a=texture2D(u_image,v_tex_a).a;float sdfdist_b=texture2D(u_image,v_tex_b).a;float sdfdist=mix(sdfdist_a,sdfdist_b,u_mix);alpha*=smoothstep(0.5-u_sdfgamma/floorwidth,0.5+u_sdfgamma/floorwidth,sdfdist);gl_FragColor=color*(alpha*opacity);\n#ifdef OVERDRAW_INSPECTOR\ngl_FragColor=vec4(1.0);\n#endif\n}","\n#define scale 0.015873016\n#define LINE_DISTANCE_SCALE 2.0\nattribute vec2 a_pos_normal;attribute vec4 a_data;uniform mat4 u_matrix;uniform mediump float u_ratio;uniform lowp float u_device_pixel_ratio;uniform vec2 u_patternscale_a;uniform float u_tex_y_a;uniform vec2 u_patternscale_b;uniform float u_tex_y_b;uniform vec2 u_units_to_pixels;varying vec2 v_normal;varying vec2 v_width2;varying vec2 v_tex_a;varying vec2 v_tex_b;varying float v_gamma_scale;\n#pragma mapbox: define highp vec4 color\n#pragma mapbox: define lowp float blur\n#pragma mapbox: define lowp float opacity\n#pragma mapbox: define mediump float gapwidth\n#pragma mapbox: define lowp float offset\n#pragma mapbox: define mediump float width\n#pragma mapbox: define lowp float floorwidth\nvoid main() {\n#pragma mapbox: initialize highp vec4 color\n#pragma mapbox: initialize lowp float blur\n#pragma mapbox: initialize lowp float opacity\n#pragma mapbox: initialize mediump float gapwidth\n#pragma mapbox: initialize lowp float offset\n#pragma mapbox: initialize mediump float width\n#pragma mapbox: initialize lowp float floorwidth\nfloat ANTIALIASING=1.0/u_device_pixel_ratio/2.0;vec2 a_extrude=a_data.xy-128.0;float a_direction=mod(a_data.z,4.0)-1.0;float a_linesofar=(floor(a_data.z/4.0)+a_data.w*64.0)*LINE_DISTANCE_SCALE;vec2 pos=floor(a_pos_normal*0.5);mediump vec2 normal=a_pos_normal-2.0*pos;normal.y=normal.y*2.0-1.0;v_normal=normal;gapwidth=gapwidth/2.0;float halfwidth=width/2.0;offset=-1.0*offset;float inset=gapwidth+(gapwidth > 0.0 ? ANTIALIASING : 0.0);float outset=gapwidth+halfwidth*(gapwidth > 0.0 ? 2.0 : 1.0)+(halfwidth==0.0 ? 0.0 : ANTIALIASING);mediump vec2 dist=outset*a_extrude*scale;mediump float u=0.5*a_direction;mediump float t=1.0-abs(u);mediump vec2 offset2=offset*a_extrude*scale*normal.y*mat2(t,-u,u,t);vec4 projected_extrude=u_matrix*vec4(dist/u_ratio,0.0,0.0);gl_Position=u_matrix*vec4(pos+offset2/u_ratio,0.0,1.0)+projected_extrude;\n#ifdef TERRAIN3D\nv_gamma_scale=1.0;\n#else\nfloat extrude_length_without_perspective=length(dist);float extrude_length_with_perspective=length(projected_extrude.xy/gl_Position.w*u_units_to_pixels);v_gamma_scale=extrude_length_without_perspective/extrude_length_with_perspective;\n#endif\nv_tex_a=vec2(a_linesofar*u_patternscale_a.x/floorwidth,normal.y*u_patternscale_a.y+u_tex_y_a);v_tex_b=vec2(a_linesofar*u_patternscale_b.x/floorwidth,normal.y*u_patternscale_b.y+u_tex_y_b);v_width2=vec2(outset,inset);}"),raster:le("uniform float u_fade_t;uniform float u_opacity;uniform sampler2D u_image0;uniform sampler2D u_image1;varying vec2 v_pos0;varying vec2 v_pos1;uniform float u_brightness_low;uniform float u_brightness_high;uniform float u_saturation_factor;uniform float u_contrast_factor;uniform vec3 u_spin_weights;void main() {vec4 color0=texture2D(u_image0,v_pos0);vec4 color1=texture2D(u_image1,v_pos1);if (color0.a > 0.0) {color0.rgb=color0.rgb/color0.a;}if (color1.a > 0.0) {color1.rgb=color1.rgb/color1.a;}vec4 color=mix(color0,color1,u_fade_t);color.a*=u_opacity;vec3 rgb=color.rgb;rgb=vec3(dot(rgb,u_spin_weights.xyz),dot(rgb,u_spin_weights.zxy),dot(rgb,u_spin_weights.yzx));float average=(color.r+color.g+color.b)/3.0;rgb+=(average-rgb)*u_saturation_factor;rgb=(rgb-0.5)*u_contrast_factor+0.5;vec3 u_high_vec=vec3(u_brightness_low,u_brightness_low,u_brightness_low);vec3 u_low_vec=vec3(u_brightness_high,u_brightness_high,u_brightness_high);gl_FragColor=vec4(mix(u_high_vec,u_low_vec,rgb)*color.a,color.a);\n#ifdef OVERDRAW_INSPECTOR\ngl_FragColor=vec4(1.0);\n#endif\n}","uniform mat4 u_matrix;uniform vec2 u_tl_parent;uniform float u_scale_parent;uniform float u_buffer_scale;attribute vec2 a_pos;attribute vec2 a_texture_pos;varying vec2 v_pos0;varying vec2 v_pos1;void main() {gl_Position=u_matrix*vec4(a_pos,0,1);v_pos0=(((a_texture_pos/8192.0)-0.5)/u_buffer_scale )+0.5;v_pos1=(v_pos0*u_scale_parent)+u_tl_parent;}"),symbolIcon:le("uniform sampler2D u_texture;varying vec2 v_tex;varying float v_fade_opacity;\n#pragma mapbox: define lowp float opacity\nvoid main() {\n#pragma mapbox: initialize lowp float opacity\nlowp float alpha=opacity*v_fade_opacity;gl_FragColor=texture2D(u_texture,v_tex)*alpha;\n#ifdef OVERDRAW_INSPECTOR\ngl_FragColor=vec4(1.0);\n#endif\n}","const float PI=3.141592653589793;attribute vec4 a_pos_offset;attribute vec4 a_data;attribute vec4 a_pixeloffset;attribute vec3 a_projected_pos;attribute float a_fade_opacity;uniform bool u_is_size_zoom_constant;uniform bool u_is_size_feature_constant;uniform highp float u_size_t;uniform highp float u_size;uniform highp float u_camera_to_center_distance;uniform highp float u_pitch;uniform bool u_rotate_symbol;uniform highp float u_aspect_ratio;uniform float u_fade_change;uniform mat4 u_matrix;uniform mat4 u_label_plane_matrix;uniform mat4 u_coord_matrix;uniform bool u_is_text;uniform bool u_pitch_with_map;uniform vec2 u_texsize;varying vec2 v_tex;varying float v_fade_opacity;\n#pragma mapbox: define lowp float opacity\nvoid main() {\n#pragma mapbox: initialize lowp float opacity\nvec2 a_pos=a_pos_offset.xy;vec2 a_offset=a_pos_offset.zw;vec2 a_tex=a_data.xy;vec2 a_size=a_data.zw;float a_size_min=floor(a_size[0]*0.5);vec2 a_pxoffset=a_pixeloffset.xy;vec2 a_minFontScale=a_pixeloffset.zw/256.0;float ele=get_elevation(a_pos);highp float segment_angle=-a_projected_pos[2];float size;if (!u_is_size_zoom_constant && !u_is_size_feature_constant) {size=mix(a_size_min,a_size[1],u_size_t)/128.0;} else if (u_is_size_zoom_constant && !u_is_size_feature_constant) {size=a_size_min/128.0;} else {size=u_size;}vec4 projectedPoint=u_matrix*vec4(a_pos,ele,1);highp float camera_to_anchor_distance=projectedPoint.w;highp float distance_ratio=u_pitch_with_map ?\ncamera_to_anchor_distance/u_camera_to_center_distance :\nu_camera_to_center_distance/camera_to_anchor_distance;highp float perspective_ratio=clamp(0.5+0.5*distance_ratio,0.0,4.0);size*=perspective_ratio;float fontScale=u_is_text ? size/24.0 : size;highp float symbol_rotation=0.0;if (u_rotate_symbol) {vec4 offsetProjectedPoint=u_matrix*vec4(a_pos+vec2(1,0),ele,1);vec2 a=projectedPoint.xy/projectedPoint.w;vec2 b=offsetProjectedPoint.xy/offsetProjectedPoint.w;symbol_rotation=atan((b.y-a.y)/u_aspect_ratio,b.x-a.x);}highp float angle_sin=sin(segment_angle+symbol_rotation);highp float angle_cos=cos(segment_angle+symbol_rotation);mat2 rotation_matrix=mat2(angle_cos,-1.0*angle_sin,angle_sin,angle_cos);vec4 projected_pos=u_label_plane_matrix*vec4(a_projected_pos.xy,ele,1.0);float z=float(u_pitch_with_map)*projected_pos.z/projected_pos.w;gl_Position=u_coord_matrix*vec4(projected_pos.xy/projected_pos.w+rotation_matrix*(a_offset/32.0*max(a_minFontScale,fontScale)+a_pxoffset/16.0),z,1.0);v_tex=a_tex/u_texsize;vec2 fade_opacity=unpack_opacity(a_fade_opacity);float fade_change=fade_opacity[1] > 0.5 ? u_fade_change :-u_fade_change;float visibility=calculate_visibility(projectedPoint);v_fade_opacity=max(0.0,min(visibility,fade_opacity[0]+fade_change));}"),symbolSDF:le("#define SDF_PX 8.0\nuniform bool u_is_halo;uniform sampler2D u_texture;uniform highp float u_gamma_scale;uniform lowp float u_device_pixel_ratio;uniform bool u_is_text;varying vec2 v_data0;varying vec3 v_data1;\n#pragma mapbox: define highp vec4 fill_color\n#pragma mapbox: define highp vec4 halo_color\n#pragma mapbox: define lowp float opacity\n#pragma mapbox: define lowp float halo_width\n#pragma mapbox: define lowp float halo_blur\nvoid main() {\n#pragma mapbox: initialize highp vec4 fill_color\n#pragma mapbox: initialize highp vec4 halo_color\n#pragma mapbox: initialize lowp float opacity\n#pragma mapbox: initialize lowp float halo_width\n#pragma mapbox: initialize lowp float halo_blur\nfloat EDGE_GAMMA=0.105/u_device_pixel_ratio;vec2 tex=v_data0.xy;float gamma_scale=v_data1.x;float size=v_data1.y;float fade_opacity=v_data1[2];float fontScale=u_is_text ? size/24.0 : size;lowp vec4 color=fill_color;highp float gamma=EDGE_GAMMA/(fontScale*u_gamma_scale);lowp float inner_edge=(256.0-64.0)/256.0;if (u_is_halo) {color=halo_color;gamma=(halo_blur*1.19/SDF_PX+EDGE_GAMMA)/(fontScale*u_gamma_scale);inner_edge=inner_edge+gamma*gamma_scale;}lowp float dist=texture2D(u_texture,tex).a;highp float gamma_scaled=gamma*gamma_scale;highp float alpha=smoothstep(inner_edge-gamma_scaled,inner_edge+gamma_scaled,dist);if (u_is_halo) {lowp float halo_edge=(6.0-halo_width/fontScale)/SDF_PX;alpha=min(smoothstep(halo_edge-gamma_scaled,halo_edge+gamma_scaled,dist),1.0-alpha);}gl_FragColor=color*(alpha*opacity*fade_opacity);\n#ifdef OVERDRAW_INSPECTOR\ngl_FragColor=vec4(1.0);\n#endif\n}","const float PI=3.141592653589793;attribute vec4 a_pos_offset;attribute vec4 a_data;attribute vec4 a_pixeloffset;attribute vec3 a_projected_pos;attribute float a_fade_opacity;uniform bool u_is_size_zoom_constant;uniform bool u_is_size_feature_constant;uniform highp float u_size_t;uniform highp float u_size;uniform mat4 u_matrix;uniform mat4 u_label_plane_matrix;uniform mat4 u_coord_matrix;uniform bool u_is_text;uniform bool u_pitch_with_map;uniform highp float u_pitch;uniform bool u_rotate_symbol;uniform highp float u_aspect_ratio;uniform highp float u_camera_to_center_distance;uniform float u_fade_change;uniform vec2 u_texsize;varying vec2 v_data0;varying vec3 v_data1;\n#pragma mapbox: define highp vec4 fill_color\n#pragma mapbox: define highp vec4 halo_color\n#pragma mapbox: define lowp float opacity\n#pragma mapbox: define lowp float halo_width\n#pragma mapbox: define lowp float halo_blur\nvoid main() {\n#pragma mapbox: initialize highp vec4 fill_color\n#pragma mapbox: initialize highp vec4 halo_color\n#pragma mapbox: initialize lowp float opacity\n#pragma mapbox: initialize lowp float halo_width\n#pragma mapbox: initialize lowp float halo_blur\nvec2 a_pos=a_pos_offset.xy;vec2 a_offset=a_pos_offset.zw;vec2 a_tex=a_data.xy;vec2 a_size=a_data.zw;float a_size_min=floor(a_size[0]*0.5);vec2 a_pxoffset=a_pixeloffset.xy;float ele=get_elevation(a_pos);highp float segment_angle=-a_projected_pos[2];float size;if (!u_is_size_zoom_constant && !u_is_size_feature_constant) {size=mix(a_size_min,a_size[1],u_size_t)/128.0;} else if (u_is_size_zoom_constant && !u_is_size_feature_constant) {size=a_size_min/128.0;} else {size=u_size;}vec4 projectedPoint=u_matrix*vec4(a_pos,ele,1);highp float camera_to_anchor_distance=projectedPoint.w;highp float distance_ratio=u_pitch_with_map ?\ncamera_to_anchor_distance/u_camera_to_center_distance :\nu_camera_to_center_distance/camera_to_anchor_distance;highp float perspective_ratio=clamp(0.5+0.5*distance_ratio,0.0,4.0);size*=perspective_ratio;float fontScale=u_is_text ? size/24.0 : size;highp float symbol_rotation=0.0;if (u_rotate_symbol) {vec4 offsetProjectedPoint=u_matrix*vec4(a_pos+vec2(1,0),ele,1);vec2 a=projectedPoint.xy/projectedPoint.w;vec2 b=offsetProjectedPoint.xy/offsetProjectedPoint.w;symbol_rotation=atan((b.y-a.y)/u_aspect_ratio,b.x-a.x);}highp float angle_sin=sin(segment_angle+symbol_rotation);highp float angle_cos=cos(segment_angle+symbol_rotation);mat2 rotation_matrix=mat2(angle_cos,-1.0*angle_sin,angle_sin,angle_cos);vec4 projected_pos=u_label_plane_matrix*vec4(a_projected_pos.xy,ele,1.0);float z=float(u_pitch_with_map)*projected_pos.z/projected_pos.w;gl_Position=u_coord_matrix*vec4(projected_pos.xy/projected_pos.w+rotation_matrix*(a_offset/32.0*fontScale+a_pxoffset),z,1.0);float gamma_scale=gl_Position.w;vec2 fade_opacity=unpack_opacity(a_fade_opacity);float visibility=calculate_visibility(projectedPoint);float fade_change=fade_opacity[1] > 0.5 ? u_fade_change :-u_fade_change;float interpolated_fade_opacity=max(0.0,min(visibility,fade_opacity[0]+fade_change));v_data0=a_tex/u_texsize;v_data1=vec3(gamma_scale,size,interpolated_fade_opacity);}"),symbolTextAndIcon:le("#define SDF_PX 8.0\n#define SDF 1.0\n#define ICON 0.0\nuniform bool u_is_halo;uniform sampler2D u_texture;uniform sampler2D u_texture_icon;uniform highp float u_gamma_scale;uniform lowp float u_device_pixel_ratio;varying vec4 v_data0;varying vec4 v_data1;\n#pragma mapbox: define highp vec4 fill_color\n#pragma mapbox: define highp vec4 halo_color\n#pragma mapbox: define lowp float opacity\n#pragma mapbox: define lowp float halo_width\n#pragma mapbox: define lowp float halo_blur\nvoid main() {\n#pragma mapbox: initialize highp vec4 fill_color\n#pragma mapbox: initialize highp vec4 halo_color\n#pragma mapbox: initialize lowp float opacity\n#pragma mapbox: initialize lowp float halo_width\n#pragma mapbox: initialize lowp float halo_blur\nfloat fade_opacity=v_data1[2];if (v_data1.w==ICON) {vec2 tex_icon=v_data0.zw;lowp float alpha=opacity*fade_opacity;gl_FragColor=texture2D(u_texture_icon,tex_icon)*alpha;\n#ifdef OVERDRAW_INSPECTOR\ngl_FragColor=vec4(1.0);\n#endif\nreturn;}vec2 tex=v_data0.xy;float EDGE_GAMMA=0.105/u_device_pixel_ratio;float gamma_scale=v_data1.x;float size=v_data1.y;float fontScale=size/24.0;lowp vec4 color=fill_color;highp float gamma=EDGE_GAMMA/(fontScale*u_gamma_scale);lowp float buff=(256.0-64.0)/256.0;if (u_is_halo) {color=halo_color;gamma=(halo_blur*1.19/SDF_PX+EDGE_GAMMA)/(fontScale*u_gamma_scale);buff=(6.0-halo_width/fontScale)/SDF_PX;}lowp float dist=texture2D(u_texture,tex).a;highp float gamma_scaled=gamma*gamma_scale;highp float alpha=smoothstep(buff-gamma_scaled,buff+gamma_scaled,dist);gl_FragColor=color*(alpha*opacity*fade_opacity);\n#ifdef OVERDRAW_INSPECTOR\ngl_FragColor=vec4(1.0);\n#endif\n}","const float PI=3.141592653589793;attribute vec4 a_pos_offset;attribute vec4 a_data;attribute vec3 a_projected_pos;attribute float a_fade_opacity;uniform bool u_is_size_zoom_constant;uniform bool u_is_size_feature_constant;uniform highp float u_size_t;uniform highp float u_size;uniform mat4 u_matrix;uniform mat4 u_label_plane_matrix;uniform mat4 u_coord_matrix;uniform bool u_is_text;uniform bool u_pitch_with_map;uniform highp float u_pitch;uniform bool u_rotate_symbol;uniform highp float u_aspect_ratio;uniform highp float u_camera_to_center_distance;uniform float u_fade_change;uniform vec2 u_texsize;uniform vec2 u_texsize_icon;varying vec4 v_data0;varying vec4 v_data1;\n#pragma mapbox: define highp vec4 fill_color\n#pragma mapbox: define highp vec4 halo_color\n#pragma mapbox: define lowp float opacity\n#pragma mapbox: define lowp float halo_width\n#pragma mapbox: define lowp float halo_blur\nvoid main() {\n#pragma mapbox: initialize highp vec4 fill_color\n#pragma mapbox: initialize highp vec4 halo_color\n#pragma mapbox: initialize lowp float opacity\n#pragma mapbox: initialize lowp float halo_width\n#pragma mapbox: initialize lowp float halo_blur\nvec2 a_pos=a_pos_offset.xy;vec2 a_offset=a_pos_offset.zw;vec2 a_tex=a_data.xy;vec2 a_size=a_data.zw;float a_size_min=floor(a_size[0]*0.5);float is_sdf=a_size[0]-2.0*a_size_min;float ele=get_elevation(a_pos);highp float segment_angle=-a_projected_pos[2];float size;if (!u_is_size_zoom_constant && !u_is_size_feature_constant) {size=mix(a_size_min,a_size[1],u_size_t)/128.0;} else if (u_is_size_zoom_constant && !u_is_size_feature_constant) {size=a_size_min/128.0;} else {size=u_size;}vec4 projectedPoint=u_matrix*vec4(a_pos,ele,1);highp float camera_to_anchor_distance=projectedPoint.w;highp float distance_ratio=u_pitch_with_map ?\ncamera_to_anchor_distance/u_camera_to_center_distance :\nu_camera_to_center_distance/camera_to_anchor_distance;highp float perspective_ratio=clamp(0.5+0.5*distance_ratio,0.0,4.0);size*=perspective_ratio;float fontScale=size/24.0;highp float symbol_rotation=0.0;if (u_rotate_symbol) {vec4 offsetProjectedPoint=u_matrix*vec4(a_pos+vec2(1,0),ele,1);vec2 a=projectedPoint.xy/projectedPoint.w;vec2 b=offsetProjectedPoint.xy/offsetProjectedPoint.w;symbol_rotation=atan((b.y-a.y)/u_aspect_ratio,b.x-a.x);}highp float angle_sin=sin(segment_angle+symbol_rotation);highp float angle_cos=cos(segment_angle+symbol_rotation);mat2 rotation_matrix=mat2(angle_cos,-1.0*angle_sin,angle_sin,angle_cos);vec4 projected_pos=u_label_plane_matrix*vec4(a_projected_pos.xy,ele,1.0);float z=float(u_pitch_with_map)*projected_pos.z/projected_pos.w;gl_Position=u_coord_matrix*vec4(projected_pos.xy/projected_pos.w+rotation_matrix*(a_offset/32.0*fontScale),z,1.0);float gamma_scale=gl_Position.w;vec2 fade_opacity=unpack_opacity(a_fade_opacity);float visibility=calculate_visibility(projectedPoint);float fade_change=fade_opacity[1] > 0.5 ? u_fade_change :-u_fade_change;float interpolated_fade_opacity=max(0.0,min(visibility,fade_opacity[0]+fade_change));v_data0.xy=a_tex/u_texsize;v_data0.zw=a_tex/u_texsize_icon;v_data1=vec4(gamma_scale,size,interpolated_fade_opacity,is_sdf);}"),terrain:le("uniform sampler2D u_texture;varying vec2 v_texture_pos;void main() {gl_FragColor=texture2D(u_texture,v_texture_pos);}",re),terrainDepth:le("varying float v_depth;const highp vec4 bitSh=vec4(256.*256.*256.,256.*256.,256.,1.);const highp vec4 bitMsk=vec4(0.,vec3(1./256.0));highp vec4 pack(highp float value) {highp vec4 comp=fract(value*bitSh);comp-=comp.xxyz*bitMsk;return comp;}void main() {gl_FragColor=pack(v_depth);}",re),terrainCoords:le("precision mediump float;uniform sampler2D u_texture;uniform float u_terrain_coords_id;varying vec2 v_texture_pos;void main() {vec4 rgba=texture2D(u_texture,v_texture_pos);gl_FragColor=vec4(rgba.r,rgba.g,rgba.b,u_terrain_coords_id);}",re)};function le(t,e){const i=/#pragma mapbox: ([\w]+) ([\w]+) ([\w]+) ([\w]+)/g,s=e.match(/attribute ([\w]+) ([\w]+)/g),a=t.match(/uniform ([\w]+) ([\w]+)([\s]*)([\w]*)/g),o=e.match(/uniform ([\w]+) ([\w]+)([\s]*)([\w]*)/g),r=o?o.concat(a):a,n={};return {fragmentSource:t=t.replace(i,((t,e,i,s,a)=>(n[a]=!0,"define"===e?`\n#ifndef HAS_UNIFORM_u_${a}\nvarying ${i} ${s} ${a};\n#else\nuniform ${i} ${s} u_${a};\n#endif\n`:`\n#ifdef HAS_UNIFORM_u_${a}\n    ${i} ${s} ${a} = u_${a};\n#endif\n`))),vertexSource:e=e.replace(i,((t,e,i,s,a)=>{const o="float"===s?"vec2":"vec4",r=a.match(/color/)?"color":o;return n[a]?"define"===e?`\n#ifndef HAS_UNIFORM_u_${a}\nuniform lowp float u_${a}_t;\nattribute ${i} ${o} a_${a};\nvarying ${i} ${s} ${a};\n#else\nuniform ${i} ${s} u_${a};\n#endif\n`:"vec4"===r?`\n#ifndef HAS_UNIFORM_u_${a}\n    ${a} = a_${a};\n#else\n    ${i} ${s} ${a} = u_${a};\n#endif\n`:`\n#ifndef HAS_UNIFORM_u_${a}\n    ${a} = unpack_mix_${r}(a_${a}, u_${a}_t);\n#else\n    ${i} ${s} ${a} = u_${a};\n#endif\n`:"define"===e?`\n#ifndef HAS_UNIFORM_u_${a}\nuniform lowp float u_${a}_t;\nattribute ${i} ${o} a_${a};\n#else\nuniform ${i} ${s} u_${a};\n#endif\n`:"vec4"===r?`\n#ifndef HAS_UNIFORM_u_${a}\n    ${i} ${s} ${a} = a_${a};\n#else\n    ${i} ${s} ${a} = u_${a};\n#endif\n`:`\n#ifndef HAS_UNIFORM_u_${a}\n    ${i} ${s} ${a} = unpack_mix_${r}(a_${a}, u_${a}_t);\n#else\n    ${i} ${s} ${a} = u_${a};\n#endif\n`})),staticAttributes:s,staticUniforms:r}}class ce{constructor(){this.boundProgram=null,this.boundLayoutVertexBuffer=null,this.boundPaintVertexBuffers=[],this.boundIndexBuffer=null,this.boundVertexOffset=null,this.boundDynamicVertexBuffer=null,this.vao=null;}bind(t,e,i,s,a,o,r,n,l){this.context=t;let c=this.boundPaintVertexBuffers.length!==s.length;for(let t=0;!c&&t<s.length;t++)this.boundPaintVertexBuffers[t]!==s[t]&&(c=!0);!this.vao||this.boundProgram!==e||this.boundLayoutVertexBuffer!==i||c||this.boundIndexBuffer!==a||this.boundVertexOffset!==o||this.boundDynamicVertexBuffer!==r||this.boundDynamicVertexBuffer2!==n||this.boundDynamicVertexBuffer3!==l?this.freshBind(e,i,s,a,o,r,n,l):(t.bindVertexArray.set(this.vao),r&&r.bind(),a&&a.dynamicDraw&&a.bind(),n&&n.bind(),l&&l.bind());}freshBind(t,e,i,s,a,o,r,n){const l=t.numAttributes,c=this.context,h=c.gl;this.vao&&this.destroy(),this.vao=c.createVertexArray(),c.bindVertexArray.set(this.vao),this.boundProgram=t,this.boundLayoutVertexBuffer=e,this.boundPaintVertexBuffers=i,this.boundIndexBuffer=s,this.boundVertexOffset=a,this.boundDynamicVertexBuffer=o,this.boundDynamicVertexBuffer2=r,this.boundDynamicVertexBuffer3=n,e.enableAttributes(h,t);for(const e of i)e.enableAttributes(h,t);o&&o.enableAttributes(h,t),r&&r.enableAttributes(h,t),n&&n.enableAttributes(h,t),e.bind(),e.setVertexAttribPointers(h,t,a);for(const e of i)e.bind(),e.setVertexAttribPointers(h,t,a);o&&(o.bind(),o.setVertexAttribPointers(h,t,a)),s&&s.bind(),r&&(r.bind(),r.setVertexAttribPointers(h,t,a)),n&&(n.bind(),n.setVertexAttribPointers(h,t,a)),c.currentNumAttributes=l;}destroy(){this.vao&&(this.context.deleteVertexArray(this.vao),this.vao=null);}}function he(t){const e=[];for(let i=0;i<t.length;i++){if(null===t[i])continue;const s=t[i].split(" ");e.push(s.pop());}return e}class ue{constructor(e,i,s,a,o,r){const n=e.gl;this.program=n.createProgram();const l=he(i.staticAttributes),c=s?s.getBinderAttributes():[],h=l.concat(c),u=ne.prelude.staticUniforms?he(ne.prelude.staticUniforms):[],d=i.staticUniforms?he(i.staticUniforms):[],_=s?s.getBinderUniforms():[],m=u.concat(d).concat(_),p=[];for(const t of m)p.indexOf(t)<0&&p.push(t);const f=s?s.defines():[];o&&f.push("#define OVERDRAW_INSPECTOR;"),r&&f.push("#define TERRAIN3D;");const g=f.concat(ne.prelude.fragmentSource,i.fragmentSource).join("\n"),v=f.concat(ne.prelude.vertexSource,i.vertexSource).join("\n"),x=n.createShader(n.FRAGMENT_SHADER);if(n.isContextLost())return void(this.failedToCreate=!0);if(n.shaderSource(x,g),n.compileShader(x),!n.getShaderParameter(x,n.COMPILE_STATUS))throw new Error(`Could not compile fragment shader: ${n.getShaderInfoLog(x)}`);n.attachShader(this.program,x);const y=n.createShader(n.VERTEX_SHADER);if(n.isContextLost())return void(this.failedToCreate=!0);if(n.shaderSource(y,v),n.compileShader(y),!n.getShaderParameter(y,n.COMPILE_STATUS))throw new Error(`Could not compile vertex shader: ${n.getShaderInfoLog(y)}`);n.attachShader(this.program,y),this.attributes={};const b={};this.numAttributes=h.length;for(let t=0;t<this.numAttributes;t++)h[t]&&(n.bindAttribLocation(this.program,t,h[t]),this.attributes[h[t]]=t);if(n.linkProgram(this.program),!n.getProgramParameter(this.program,n.LINK_STATUS))throw new Error(`Program failed to link: ${n.getProgramInfoLog(this.program)}`);n.deleteShader(y),n.deleteShader(x);for(let t=0;t<p.length;t++){const e=p[t];if(e&&!b[e]){const t=n.getUniformLocation(this.program,e);t&&(b[e]=t);}}this.fixedUniforms=a(e,b),this.terrainUniforms=((e,i)=>({u_depth:new t.Uniform1i(e,i.u_depth),u_terrain:new t.Uniform1i(e,i.u_terrain),u_terrain_dim:new t.Uniform1f(e,i.u_terrain_dim),u_terrain_matrix:new t.UniformMatrix4f(e,i.u_terrain_matrix),u_terrain_unpack:new t.Uniform4f(e,i.u_terrain_unpack),u_terrain_exaggeration:new t.Uniform1f(e,i.u_terrain_exaggeration)}))(e,b),this.binderUniforms=s?s.getUniforms(e,b):[];}draw(t,e,i,s,a,o,r,n,l,c,h,u,d,_,m,p,f,g){const v=t.gl;if(this.failedToCreate)return;if(t.program.set(this.program),t.setDepthMode(i),t.setStencilMode(s),t.setColorMode(a),t.setCullFace(o),n){t.activeTexture.set(v.TEXTURE2),v.bindTexture(v.TEXTURE_2D,n.depthTexture),t.activeTexture.set(v.TEXTURE3),v.bindTexture(v.TEXTURE_2D,n.texture);for(const t in this.terrainUniforms)this.terrainUniforms[t].set(n[t]);}for(const t in this.fixedUniforms)this.fixedUniforms[t].set(r[t]);m&&m.setUniforms(t,this.binderUniforms,d,{zoom:_});let x=0;switch(e){case v.LINES:x=2;break;case v.TRIANGLES:x=3;break;case v.LINE_STRIP:x=1;}for(const i of u.get()){const s=i.vaos||(i.vaos={});(s[l]||(s[l]=new ce)).bind(t,this,c,m?m.getPaintVertexBuffers():[],h,i.vertexOffset,p,f,g),v.drawElements(e,i.primitiveLength*x,v.UNSIGNED_SHORT,i.primitiveOffset*x*2);}}}function de(t,e,i){const s=1/Ct(i,1,e.transform.tileZoom),a=Math.pow(2,i.tileID.overscaledZ),o=i.tileSize*Math.pow(2,e.transform.tileZoom)/a,r=o*(i.tileID.canonical.x+i.tileID.wrap*a),n=o*i.tileID.canonical.y;return {u_image:0,u_texsize:i.imageAtlasTexture.size,u_scale:[s,t.fromScale,t.toScale],u_fade:t.t,u_pixel_coord_upper:[r>>16,n>>16],u_pixel_coord_lower:[65535&r,65535&n]}}const _e=(e,i,s,a)=>{const o=i.style.light,r=o.properties.get("position"),n=[r.x,r.y,r.z],l=function(){var e=new t.ARRAY_TYPE(9);return t.ARRAY_TYPE!=Float32Array&&(e[1]=0,e[2]=0,e[3]=0,e[5]=0,e[6]=0,e[7]=0),e[0]=1,e[4]=1,e[8]=1,e}();"viewport"===o.properties.get("anchor")&&function(t,e){var i=Math.sin(e),s=Math.cos(e);t[0]=s,t[1]=i,t[2]=0,t[3]=-i,t[4]=s,t[5]=0,t[6]=0,t[7]=0,t[8]=1;}(l,-i.transform.angle),function(t,e,i){var s=e[0],a=e[1],o=e[2];t[0]=s*i[0]+a*i[3]+o*i[6],t[1]=s*i[1]+a*i[4]+o*i[7],t[2]=s*i[2]+a*i[5]+o*i[8];}(n,n,l);const c=o.properties.get("color");return {u_matrix:e,u_lightpos:n,u_lightintensity:o.properties.get("intensity"),u_lightcolor:[c.r,c.g,c.b],u_vertical_gradient:+s,u_opacity:a}},me=(e,i,s,a,o,r,n)=>t.extend(_e(e,i,s,a),de(r,i,n),{u_height_factor:-Math.pow(2,o.overscaledZ)/n.tileSize/8}),pe=t=>({u_matrix:t}),fe=(e,i,s,a)=>t.extend(pe(e),de(s,i,a)),ge=(t,e)=>({u_matrix:t,u_world:e}),ve=(e,i,s,a,o)=>t.extend(fe(e,i,s,a),{u_world:o}),xe=(t,e,i,s)=>{const a=t.transform;let o,r;if("map"===s.paint.get("circle-pitch-alignment")){const t=Ct(i,1,a.zoom);o=!0,r=[t,t];}else o=!1,r=a.pixelsToGLUnits;return {u_camera_to_center_distance:a.cameraToCenterDistance,u_scale_with_map:+("map"===s.paint.get("circle-pitch-scale")),u_matrix:t.translatePosMatrix(e.posMatrix,i,s.paint.get("circle-translate"),s.paint.get("circle-translate-anchor")),u_pitch_with_map:+o,u_device_pixel_ratio:t.pixelRatio,u_extrude_scale:r}},ye=(t,e,i)=>{const s=Ct(i,1,e.zoom),a=Math.pow(2,e.zoom-i.tileID.overscaledZ),o=i.tileID.overscaleFactor();return {u_matrix:t,u_camera_to_center_distance:e.cameraToCenterDistance,u_pixels_to_tile_units:s,u_extrude_scale:[e.pixelsToGLUnits[0]/(s*a),e.pixelsToGLUnits[1]/(s*a)],u_overscale_factor:o}},be=(t,e,i=1)=>({u_matrix:t,u_color:e,u_overlay:0,u_overlay_scale:i}),we=t=>({u_matrix:t}),Te=(t,e,i,s)=>({u_matrix:t,u_extrude_scale:Ct(e,1,i),u_intensity:s});function Ee(e,i){const s=Math.pow(2,i.canonical.z),a=i.canonical.y;return [new t.MercatorCoordinate(0,a/s).toLngLat().lat,new t.MercatorCoordinate(0,(a+1)/s).toLngLat().lat]}const Ie=(t,e,i,s)=>{const a=t.transform;return {u_matrix:Me(t,e,i,s),u_ratio:1/Ct(e,1,a.zoom),u_device_pixel_ratio:t.pixelRatio,u_units_to_pixels:[1/a.pixelsToGLUnits[0],1/a.pixelsToGLUnits[1]]}},Se=(e,i,s,a,o)=>t.extend(Ie(e,i,s,o),{u_image:0,u_image_height:a}),Ce=(t,e,i,s,a)=>{const o=t.transform,r=De(e,o);return {u_matrix:Me(t,e,i,a),u_texsize:e.imageAtlasTexture.size,u_ratio:1/Ct(e,1,o.zoom),u_device_pixel_ratio:t.pixelRatio,u_image:0,u_scale:[r,s.fromScale,s.toScale],u_fade:s.t,u_units_to_pixels:[1/o.pixelsToGLUnits[0],1/o.pixelsToGLUnits[1]]}},Pe=(e,i,s,a,o,r)=>{const n=e.lineAtlas,l=De(i,e.transform),c="round"===s.layout.get("line-cap"),h=n.getDash(a.from,c),u=n.getDash(a.to,c),d=h.width*o.fromScale,_=u.width*o.toScale;return t.extend(Ie(e,i,s,r),{u_patternscale_a:[l/d,-h.height/2],u_patternscale_b:[l/_,-u.height/2],u_sdfgamma:n.width/(256*Math.min(d,_)*e.pixelRatio)/2,u_image:0,u_tex_y_a:h.y,u_tex_y_b:u.y,u_mix:o.t})};function De(t,e){return 1/Ct(t,1,e.tileZoom)}function Me(t,e,i,s){return t.translatePosMatrix(s?s.posMatrix:e.tileID.posMatrix,e,i.paint.get("line-translate"),i.paint.get("line-translate-anchor"))}const ze=(t,e,i,s,a)=>{return {u_matrix:t,u_tl_parent:e,u_scale_parent:i,u_buffer_scale:1,u_fade_t:s.mix,u_opacity:s.opacity*a.paint.get("raster-opacity"),u_image0:0,u_image1:1,u_brightness_low:a.paint.get("raster-brightness-min"),u_brightness_high:a.paint.get("raster-brightness-max"),u_saturation_factor:(r=a.paint.get("raster-saturation"),r>0?1-1/(1.001-r):-r),u_contrast_factor:(o=a.paint.get("raster-contrast"),o>0?1/(1-o):1+o),u_spin_weights:Ae(a.paint.get("raster-hue-rotate"))};var o,r;};function Ae(t){t*=Math.PI/180;const e=Math.sin(t),i=Math.cos(t);return [(2*i+1)/3,(-Math.sqrt(3)*e-i+1)/3,(Math.sqrt(3)*e-i+1)/3]}const Le=(t,e,i,s,a,o,r,n,l,c)=>{const h=a.transform;return {u_is_size_zoom_constant:+("constant"===t||"source"===t),u_is_size_feature_constant:+("constant"===t||"camera"===t),u_size_t:e?e.uSizeT:0,u_size:e?e.uSize:0,u_camera_to_center_distance:h.cameraToCenterDistance,u_pitch:h.pitch/360*2*Math.PI,u_rotate_symbol:+i,u_aspect_ratio:h.width/h.height,u_fade_change:a.options.fadeDuration?a.symbolFadeChange:1,u_matrix:o,u_label_plane_matrix:r,u_coord_matrix:n,u_is_text:+l,u_pitch_with_map:+s,u_texsize:c,u_texture:0}},Re=(e,i,s,a,o,r,n,l,c,h,u)=>{const d=o.transform;return t.extend(Le(e,i,s,a,o,r,n,l,c,h),{u_gamma_scale:a?Math.cos(d._pitch)*d.cameraToCenterDistance:1,u_device_pixel_ratio:o.pixelRatio,u_is_halo:+u})},ke=(e,i,s,a,o,r,n,l,c,h)=>t.extend(Re(e,i,s,a,o,r,n,l,!0,c,!0),{u_texsize_icon:h,u_texture_icon:1}),Fe=(t,e,i)=>({u_matrix:t,u_opacity:e,u_color:i}),Be=(e,i,s,a,o,r)=>t.extend(function(t,e,i,s){const a=i.imageManager.getPattern(t.from.toString()),o=i.imageManager.getPattern(t.to.toString()),{width:r,height:n}=i.imageManager.getPixelSize(),l=Math.pow(2,s.tileID.overscaledZ),c=s.tileSize*Math.pow(2,i.transform.tileZoom)/l,h=c*(s.tileID.canonical.x+s.tileID.wrap*l),u=c*s.tileID.canonical.y;return {u_image:0,u_pattern_tl_a:a.tl,u_pattern_br_a:a.br,u_pattern_tl_b:o.tl,u_pattern_br_b:o.br,u_texsize:[r,n],u_mix:e.t,u_pattern_size_a:a.displaySize,u_pattern_size_b:o.displaySize,u_scale_a:e.fromScale,u_scale_b:e.toScale,u_tile_units_to_pixels:1/Ct(s,1,i.transform.tileZoom),u_pixel_coord_upper:[h>>16,u>>16],u_pixel_coord_lower:[65535&h,65535&u]}}(a,r,s,o),{u_matrix:e,u_opacity:i}),Ue={fillExtrusion:(e,i)=>({u_matrix:new t.UniformMatrix4f(e,i.u_matrix),u_lightpos:new t.Uniform3f(e,i.u_lightpos),u_lightintensity:new t.Uniform1f(e,i.u_lightintensity),u_lightcolor:new t.Uniform3f(e,i.u_lightcolor),u_vertical_gradient:new t.Uniform1f(e,i.u_vertical_gradient),u_opacity:new t.Uniform1f(e,i.u_opacity)}),fillExtrusionPattern:(e,i)=>({u_matrix:new t.UniformMatrix4f(e,i.u_matrix),u_lightpos:new t.Uniform3f(e,i.u_lightpos),u_lightintensity:new t.Uniform1f(e,i.u_lightintensity),u_lightcolor:new t.Uniform3f(e,i.u_lightcolor),u_vertical_gradient:new t.Uniform1f(e,i.u_vertical_gradient),u_height_factor:new t.Uniform1f(e,i.u_height_factor),u_image:new t.Uniform1i(e,i.u_image),u_texsize:new t.Uniform2f(e,i.u_texsize),u_pixel_coord_upper:new t.Uniform2f(e,i.u_pixel_coord_upper),u_pixel_coord_lower:new t.Uniform2f(e,i.u_pixel_coord_lower),u_scale:new t.Uniform3f(e,i.u_scale),u_fade:new t.Uniform1f(e,i.u_fade),u_opacity:new t.Uniform1f(e,i.u_opacity)}),fill:(e,i)=>({u_matrix:new t.UniformMatrix4f(e,i.u_matrix)}),fillPattern:(e,i)=>({u_matrix:new t.UniformMatrix4f(e,i.u_matrix),u_image:new t.Uniform1i(e,i.u_image),u_texsize:new t.Uniform2f(e,i.u_texsize),u_pixel_coord_upper:new t.Uniform2f(e,i.u_pixel_coord_upper),u_pixel_coord_lower:new t.Uniform2f(e,i.u_pixel_coord_lower),u_scale:new t.Uniform3f(e,i.u_scale),u_fade:new t.Uniform1f(e,i.u_fade)}),fillOutline:(e,i)=>({u_matrix:new t.UniformMatrix4f(e,i.u_matrix),u_world:new t.Uniform2f(e,i.u_world)}),fillOutlinePattern:(e,i)=>({u_matrix:new t.UniformMatrix4f(e,i.u_matrix),u_world:new t.Uniform2f(e,i.u_world),u_image:new t.Uniform1i(e,i.u_image),u_texsize:new t.Uniform2f(e,i.u_texsize),u_pixel_coord_upper:new t.Uniform2f(e,i.u_pixel_coord_upper),u_pixel_coord_lower:new t.Uniform2f(e,i.u_pixel_coord_lower),u_scale:new t.Uniform3f(e,i.u_scale),u_fade:new t.Uniform1f(e,i.u_fade)}),circle:(e,i)=>({u_camera_to_center_distance:new t.Uniform1f(e,i.u_camera_to_center_distance),u_scale_with_map:new t.Uniform1i(e,i.u_scale_with_map),u_pitch_with_map:new t.Uniform1i(e,i.u_pitch_with_map),u_extrude_scale:new t.Uniform2f(e,i.u_extrude_scale),u_device_pixel_ratio:new t.Uniform1f(e,i.u_device_pixel_ratio),u_matrix:new t.UniformMatrix4f(e,i.u_matrix)}),collisionBox:(e,i)=>({u_matrix:new t.UniformMatrix4f(e,i.u_matrix),u_camera_to_center_distance:new t.Uniform1f(e,i.u_camera_to_center_distance),u_pixels_to_tile_units:new t.Uniform1f(e,i.u_pixels_to_tile_units),u_extrude_scale:new t.Uniform2f(e,i.u_extrude_scale),u_overscale_factor:new t.Uniform1f(e,i.u_overscale_factor)}),collisionCircle:(e,i)=>({u_matrix:new t.UniformMatrix4f(e,i.u_matrix),u_inv_matrix:new t.UniformMatrix4f(e,i.u_inv_matrix),u_camera_to_center_distance:new t.Uniform1f(e,i.u_camera_to_center_distance),u_viewport_size:new t.Uniform2f(e,i.u_viewport_size)}),debug:(e,i)=>({u_color:new t.UniformColor(e,i.u_color),u_matrix:new t.UniformMatrix4f(e,i.u_matrix),u_overlay:new t.Uniform1i(e,i.u_overlay),u_overlay_scale:new t.Uniform1f(e,i.u_overlay_scale)}),clippingMask:(e,i)=>({u_matrix:new t.UniformMatrix4f(e,i.u_matrix)}),heatmap:(e,i)=>({u_extrude_scale:new t.Uniform1f(e,i.u_extrude_scale),u_intensity:new t.Uniform1f(e,i.u_intensity),u_matrix:new t.UniformMatrix4f(e,i.u_matrix)}),heatmapTexture:(e,i)=>({u_matrix:new t.UniformMatrix4f(e,i.u_matrix),u_world:new t.Uniform2f(e,i.u_world),u_image:new t.Uniform1i(e,i.u_image),u_color_ramp:new t.Uniform1i(e,i.u_color_ramp),u_opacity:new t.Uniform1f(e,i.u_opacity)}),hillshade:(e,i)=>({u_matrix:new t.UniformMatrix4f(e,i.u_matrix),u_image:new t.Uniform1i(e,i.u_image),u_latrange:new t.Uniform2f(e,i.u_latrange),u_light:new t.Uniform2f(e,i.u_light),u_shadow:new t.UniformColor(e,i.u_shadow),u_highlight:new t.UniformColor(e,i.u_highlight),u_accent:new t.UniformColor(e,i.u_accent)}),hillshadePrepare:(e,i)=>({u_matrix:new t.UniformMatrix4f(e,i.u_matrix),u_image:new t.Uniform1i(e,i.u_image),u_dimension:new t.Uniform2f(e,i.u_dimension),u_zoom:new t.Uniform1f(e,i.u_zoom),u_unpack:new t.Uniform4f(e,i.u_unpack)}),line:(e,i)=>({u_matrix:new t.UniformMatrix4f(e,i.u_matrix),u_ratio:new t.Uniform1f(e,i.u_ratio),u_device_pixel_ratio:new t.Uniform1f(e,i.u_device_pixel_ratio),u_units_to_pixels:new t.Uniform2f(e,i.u_units_to_pixels)}),lineGradient:(e,i)=>({u_matrix:new t.UniformMatrix4f(e,i.u_matrix),u_ratio:new t.Uniform1f(e,i.u_ratio),u_device_pixel_ratio:new t.Uniform1f(e,i.u_device_pixel_ratio),u_units_to_pixels:new t.Uniform2f(e,i.u_units_to_pixels),u_image:new t.Uniform1i(e,i.u_image),u_image_height:new t.Uniform1f(e,i.u_image_height)}),linePattern:(e,i)=>({u_matrix:new t.UniformMatrix4f(e,i.u_matrix),u_texsize:new t.Uniform2f(e,i.u_texsize),u_ratio:new t.Uniform1f(e,i.u_ratio),u_device_pixel_ratio:new t.Uniform1f(e,i.u_device_pixel_ratio),u_image:new t.Uniform1i(e,i.u_image),u_units_to_pixels:new t.Uniform2f(e,i.u_units_to_pixels),u_scale:new t.Uniform3f(e,i.u_scale),u_fade:new t.Uniform1f(e,i.u_fade)}),lineSDF:(e,i)=>({u_matrix:new t.UniformMatrix4f(e,i.u_matrix),u_ratio:new t.Uniform1f(e,i.u_ratio),u_device_pixel_ratio:new t.Uniform1f(e,i.u_device_pixel_ratio),u_units_to_pixels:new t.Uniform2f(e,i.u_units_to_pixels),u_patternscale_a:new t.Uniform2f(e,i.u_patternscale_a),u_patternscale_b:new t.Uniform2f(e,i.u_patternscale_b),u_sdfgamma:new t.Uniform1f(e,i.u_sdfgamma),u_image:new t.Uniform1i(e,i.u_image),u_tex_y_a:new t.Uniform1f(e,i.u_tex_y_a),u_tex_y_b:new t.Uniform1f(e,i.u_tex_y_b),u_mix:new t.Uniform1f(e,i.u_mix)}),raster:(e,i)=>({u_matrix:new t.UniformMatrix4f(e,i.u_matrix),u_tl_parent:new t.Uniform2f(e,i.u_tl_parent),u_scale_parent:new t.Uniform1f(e,i.u_scale_parent),u_buffer_scale:new t.Uniform1f(e,i.u_buffer_scale),u_fade_t:new t.Uniform1f(e,i.u_fade_t),u_opacity:new t.Uniform1f(e,i.u_opacity),u_image0:new t.Uniform1i(e,i.u_image0),u_image1:new t.Uniform1i(e,i.u_image1),u_brightness_low:new t.Uniform1f(e,i.u_brightness_low),u_brightness_high:new t.Uniform1f(e,i.u_brightness_high),u_saturation_factor:new t.Uniform1f(e,i.u_saturation_factor),u_contrast_factor:new t.Uniform1f(e,i.u_contrast_factor),u_spin_weights:new t.Uniform3f(e,i.u_spin_weights)}),symbolIcon:(e,i)=>({u_is_size_zoom_constant:new t.Uniform1i(e,i.u_is_size_zoom_constant),u_is_size_feature_constant:new t.Uniform1i(e,i.u_is_size_feature_constant),u_size_t:new t.Uniform1f(e,i.u_size_t),u_size:new t.Uniform1f(e,i.u_size),u_camera_to_center_distance:new t.Uniform1f(e,i.u_camera_to_center_distance),u_pitch:new t.Uniform1f(e,i.u_pitch),u_rotate_symbol:new t.Uniform1i(e,i.u_rotate_symbol),u_aspect_ratio:new t.Uniform1f(e,i.u_aspect_ratio),u_fade_change:new t.Uniform1f(e,i.u_fade_change),u_matrix:new t.UniformMatrix4f(e,i.u_matrix),u_label_plane_matrix:new t.UniformMatrix4f(e,i.u_label_plane_matrix),u_coord_matrix:new t.UniformMatrix4f(e,i.u_coord_matrix),u_is_text:new t.Uniform1i(e,i.u_is_text),u_pitch_with_map:new t.Uniform1i(e,i.u_pitch_with_map),u_texsize:new t.Uniform2f(e,i.u_texsize),u_texture:new t.Uniform1i(e,i.u_texture)}),symbolSDF:(e,i)=>({u_is_size_zoom_constant:new t.Uniform1i(e,i.u_is_size_zoom_constant),u_is_size_feature_constant:new t.Uniform1i(e,i.u_is_size_feature_constant),u_size_t:new t.Uniform1f(e,i.u_size_t),u_size:new t.Uniform1f(e,i.u_size),u_camera_to_center_distance:new t.Uniform1f(e,i.u_camera_to_center_distance),u_pitch:new t.Uniform1f(e,i.u_pitch),u_rotate_symbol:new t.Uniform1i(e,i.u_rotate_symbol),u_aspect_ratio:new t.Uniform1f(e,i.u_aspect_ratio),u_fade_change:new t.Uniform1f(e,i.u_fade_change),u_matrix:new t.UniformMatrix4f(e,i.u_matrix),u_label_plane_matrix:new t.UniformMatrix4f(e,i.u_label_plane_matrix),u_coord_matrix:new t.UniformMatrix4f(e,i.u_coord_matrix),u_is_text:new t.Uniform1i(e,i.u_is_text),u_pitch_with_map:new t.Uniform1i(e,i.u_pitch_with_map),u_texsize:new t.Uniform2f(e,i.u_texsize),u_texture:new t.Uniform1i(e,i.u_texture),u_gamma_scale:new t.Uniform1f(e,i.u_gamma_scale),u_device_pixel_ratio:new t.Uniform1f(e,i.u_device_pixel_ratio),u_is_halo:new t.Uniform1i(e,i.u_is_halo)}),symbolTextAndIcon:(e,i)=>({u_is_size_zoom_constant:new t.Uniform1i(e,i.u_is_size_zoom_constant),u_is_size_feature_constant:new t.Uniform1i(e,i.u_is_size_feature_constant),u_size_t:new t.Uniform1f(e,i.u_size_t),u_size:new t.Uniform1f(e,i.u_size),u_camera_to_center_distance:new t.Uniform1f(e,i.u_camera_to_center_distance),u_pitch:new t.Uniform1f(e,i.u_pitch),u_rotate_symbol:new t.Uniform1i(e,i.u_rotate_symbol),u_aspect_ratio:new t.Uniform1f(e,i.u_aspect_ratio),u_fade_change:new t.Uniform1f(e,i.u_fade_change),u_matrix:new t.UniformMatrix4f(e,i.u_matrix),u_label_plane_matrix:new t.UniformMatrix4f(e,i.u_label_plane_matrix),u_coord_matrix:new t.UniformMatrix4f(e,i.u_coord_matrix),u_is_text:new t.Uniform1i(e,i.u_is_text),u_pitch_with_map:new t.Uniform1i(e,i.u_pitch_with_map),u_texsize:new t.Uniform2f(e,i.u_texsize),u_texsize_icon:new t.Uniform2f(e,i.u_texsize_icon),u_texture:new t.Uniform1i(e,i.u_texture),u_texture_icon:new t.Uniform1i(e,i.u_texture_icon),u_gamma_scale:new t.Uniform1f(e,i.u_gamma_scale),u_device_pixel_ratio:new t.Uniform1f(e,i.u_device_pixel_ratio),u_is_halo:new t.Uniform1i(e,i.u_is_halo)}),background:(e,i)=>({u_matrix:new t.UniformMatrix4f(e,i.u_matrix),u_opacity:new t.Uniform1f(e,i.u_opacity),u_color:new t.UniformColor(e,i.u_color)}),backgroundPattern:(e,i)=>({u_matrix:new t.UniformMatrix4f(e,i.u_matrix),u_opacity:new t.Uniform1f(e,i.u_opacity),u_image:new t.Uniform1i(e,i.u_image),u_pattern_tl_a:new t.Uniform2f(e,i.u_pattern_tl_a),u_pattern_br_a:new t.Uniform2f(e,i.u_pattern_br_a),u_pattern_tl_b:new t.Uniform2f(e,i.u_pattern_tl_b),u_pattern_br_b:new t.Uniform2f(e,i.u_pattern_br_b),u_texsize:new t.Uniform2f(e,i.u_texsize),u_mix:new t.Uniform1f(e,i.u_mix),u_pattern_size_a:new t.Uniform2f(e,i.u_pattern_size_a),u_pattern_size_b:new t.Uniform2f(e,i.u_pattern_size_b),u_scale_a:new t.Uniform1f(e,i.u_scale_a),u_scale_b:new t.Uniform1f(e,i.u_scale_b),u_pixel_coord_upper:new t.Uniform2f(e,i.u_pixel_coord_upper),u_pixel_coord_lower:new t.Uniform2f(e,i.u_pixel_coord_lower),u_tile_units_to_pixels:new t.Uniform1f(e,i.u_tile_units_to_pixels)}),terrain:(e,i)=>({u_matrix:new t.UniformMatrix4f(e,i.u_matrix),u_texture:new t.Uniform1i(e,i.u_texture),u_ele_delta:new t.Uniform1f(e,i.u_ele_delta)}),terrainDepth:(e,i)=>({u_matrix:new t.UniformMatrix4f(e,i.u_matrix),u_ele_delta:new t.Uniform1f(e,i.u_ele_delta)}),terrainCoords:(e,i)=>({u_matrix:new t.UniformMatrix4f(e,i.u_matrix),u_texture:new t.Uniform1i(e,i.u_texture),u_terrain_coords_id:new t.Uniform1f(e,i.u_terrain_coords_id),u_ele_delta:new t.Uniform1f(e,i.u_ele_delta)})};class Oe{constructor(t,e,i){this.context=t;const s=t.gl;this.buffer=s.createBuffer(),this.dynamicDraw=Boolean(i),this.context.unbindVAO(),t.bindElementBuffer.set(this.buffer),s.bufferData(s.ELEMENT_ARRAY_BUFFER,e.arrayBuffer,this.dynamicDraw?s.DYNAMIC_DRAW:s.STATIC_DRAW),this.dynamicDraw||delete e.arrayBuffer;}bind(){this.context.bindElementBuffer.set(this.buffer);}updateData(t){const e=this.context.gl;if(!this.dynamicDraw)throw new Error("Attempted to update data while not in dynamic mode.");this.context.unbindVAO(),this.bind(),e.bufferSubData(e.ELEMENT_ARRAY_BUFFER,0,t.arrayBuffer);}destroy(){this.buffer&&(this.context.gl.deleteBuffer(this.buffer),delete this.buffer);}}const Ne={Int8:"BYTE",Uint8:"UNSIGNED_BYTE",Int16:"SHORT",Uint16:"UNSIGNED_SHORT",Int32:"INT",Uint32:"UNSIGNED_INT",Float32:"FLOAT"};class Ze{constructor(t,e,i,s){this.length=e.length,this.attributes=i,this.itemSize=e.bytesPerElement,this.dynamicDraw=s,this.context=t;const a=t.gl;this.buffer=a.createBuffer(),t.bindVertexBuffer.set(this.buffer),a.bufferData(a.ARRAY_BUFFER,e.arrayBuffer,this.dynamicDraw?a.DYNAMIC_DRAW:a.STATIC_DRAW),this.dynamicDraw||delete e.arrayBuffer;}bind(){this.context.bindVertexBuffer.set(this.buffer);}updateData(t){if(t.length!==this.length)throw new Error(`Length of new data is ${t.length}, which doesn't match current length of ${this.length}`);const e=this.context.gl;this.bind(),e.bufferSubData(e.ARRAY_BUFFER,0,t.arrayBuffer);}enableAttributes(t,e){for(let i=0;i<this.attributes.length;i++){const s=e.attributes[this.attributes[i].name];void 0!==s&&t.enableVertexAttribArray(s);}}setVertexAttribPointers(t,e,i){for(let s=0;s<this.attributes.length;s++){const a=this.attributes[s],o=e.attributes[a.name];void 0!==o&&t.vertexAttribPointer(o,a.components,t[Ne[a.type]],!1,this.itemSize,a.offset+this.itemSize*(i||0));}}destroy(){this.buffer&&(this.context.gl.deleteBuffer(this.buffer),delete this.buffer);}}const Ge=new WeakMap;function Ve(t){if(Ge.has(t))return Ge.get(t);{const e=t.getParameter(t.VERSION).startsWith("WebGL 2.0");return Ge.set(t,e),e}}class qe{constructor(t){this.gl=t.gl,this.default=this.getDefault(),this.current=this.default,this.dirty=!1;}get(){return this.current}set(t){}getDefault(){return this.default}setDefault(){this.set(this.default);}}class je extends qe{getDefault(){return t.Color.transparent}set(t){const e=this.current;(t.r!==e.r||t.g!==e.g||t.b!==e.b||t.a!==e.a||this.dirty)&&(this.gl.clearColor(t.r,t.g,t.b,t.a),this.current=t,this.dirty=!1);}}class $e extends qe{getDefault(){return 1}set(t){(t!==this.current||this.dirty)&&(this.gl.clearDepth(t),this.current=t,this.dirty=!1);}}class Xe extends qe{getDefault(){return 0}set(t){(t!==this.current||this.dirty)&&(this.gl.clearStencil(t),this.current=t,this.dirty=!1);}}class We extends qe{getDefault(){return [!0,!0,!0,!0]}set(t){const e=this.current;(t[0]!==e[0]||t[1]!==e[1]||t[2]!==e[2]||t[3]!==e[3]||this.dirty)&&(this.gl.colorMask(t[0],t[1],t[2],t[3]),this.current=t,this.dirty=!1);}}class He extends qe{getDefault(){return !0}set(t){(t!==this.current||this.dirty)&&(this.gl.depthMask(t),this.current=t,this.dirty=!1);}}class Ke extends qe{getDefault(){return 255}set(t){(t!==this.current||this.dirty)&&(this.gl.stencilMask(t),this.current=t,this.dirty=!1);}}class Ye extends qe{getDefault(){return {func:this.gl.ALWAYS,ref:0,mask:255}}set(t){const e=this.current;(t.func!==e.func||t.ref!==e.ref||t.mask!==e.mask||this.dirty)&&(this.gl.stencilFunc(t.func,t.ref,t.mask),this.current=t,this.dirty=!1);}}class Je extends qe{getDefault(){const t=this.gl;return [t.KEEP,t.KEEP,t.KEEP]}set(t){const e=this.current;(t[0]!==e[0]||t[1]!==e[1]||t[2]!==e[2]||this.dirty)&&(this.gl.stencilOp(t[0],t[1],t[2]),this.current=t,this.dirty=!1);}}class Qe extends qe{getDefault(){return !1}set(t){if(t===this.current&&!this.dirty)return;const e=this.gl;t?e.enable(e.STENCIL_TEST):e.disable(e.STENCIL_TEST),this.current=t,this.dirty=!1;}}class ti extends qe{getDefault(){return [0,1]}set(t){const e=this.current;(t[0]!==e[0]||t[1]!==e[1]||this.dirty)&&(this.gl.depthRange(t[0],t[1]),this.current=t,this.dirty=!1);}}class ei extends qe{getDefault(){return !1}set(t){if(t===this.current&&!this.dirty)return;const e=this.gl;t?e.enable(e.DEPTH_TEST):e.disable(e.DEPTH_TEST),this.current=t,this.dirty=!1;}}class ii extends qe{getDefault(){return this.gl.LESS}set(t){(t!==this.current||this.dirty)&&(this.gl.depthFunc(t),this.current=t,this.dirty=!1);}}class si extends qe{getDefault(){return !1}set(t){if(t===this.current&&!this.dirty)return;const e=this.gl;t?e.enable(e.BLEND):e.disable(e.BLEND),this.current=t,this.dirty=!1;}}class ai extends qe{getDefault(){const t=this.gl;return [t.ONE,t.ZERO]}set(t){const e=this.current;(t[0]!==e[0]||t[1]!==e[1]||this.dirty)&&(this.gl.blendFunc(t[0],t[1]),this.current=t,this.dirty=!1);}}class oi extends qe{getDefault(){return t.Color.transparent}set(t){const e=this.current;(t.r!==e.r||t.g!==e.g||t.b!==e.b||t.a!==e.a||this.dirty)&&(this.gl.blendColor(t.r,t.g,t.b,t.a),this.current=t,this.dirty=!1);}}class ri extends qe{getDefault(){return this.gl.FUNC_ADD}set(t){(t!==this.current||this.dirty)&&(this.gl.blendEquation(t),this.current=t,this.dirty=!1);}}class ni extends qe{getDefault(){return !1}set(t){if(t===this.current&&!this.dirty)return;const e=this.gl;t?e.enable(e.CULL_FACE):e.disable(e.CULL_FACE),this.current=t,this.dirty=!1;}}class li extends qe{getDefault(){return this.gl.BACK}set(t){(t!==this.current||this.dirty)&&(this.gl.cullFace(t),this.current=t,this.dirty=!1);}}class ci extends qe{getDefault(){return this.gl.CCW}set(t){(t!==this.current||this.dirty)&&(this.gl.frontFace(t),this.current=t,this.dirty=!1);}}class hi extends qe{getDefault(){return null}set(t){(t!==this.current||this.dirty)&&(this.gl.useProgram(t),this.current=t,this.dirty=!1);}}class ui extends qe{getDefault(){return this.gl.TEXTURE0}set(t){(t!==this.current||this.dirty)&&(this.gl.activeTexture(t),this.current=t,this.dirty=!1);}}class di extends qe{getDefault(){const t=this.gl;return [0,0,t.drawingBufferWidth,t.drawingBufferHeight]}set(t){const e=this.current;(t[0]!==e[0]||t[1]!==e[1]||t[2]!==e[2]||t[3]!==e[3]||this.dirty)&&(this.gl.viewport(t[0],t[1],t[2],t[3]),this.current=t,this.dirty=!1);}}class _i extends qe{getDefault(){return null}set(t){if(t===this.current&&!this.dirty)return;const e=this.gl;e.bindFramebuffer(e.FRAMEBUFFER,t),this.current=t,this.dirty=!1;}}class mi extends qe{getDefault(){return null}set(t){if(t===this.current&&!this.dirty)return;const e=this.gl;e.bindRenderbuffer(e.RENDERBUFFER,t),this.current=t,this.dirty=!1;}}class pi extends qe{getDefault(){return null}set(t){if(t===this.current&&!this.dirty)return;const e=this.gl;e.bindTexture(e.TEXTURE_2D,t),this.current=t,this.dirty=!1;}}class fi extends qe{getDefault(){return null}set(t){if(t===this.current&&!this.dirty)return;const e=this.gl;e.bindBuffer(e.ARRAY_BUFFER,t),this.current=t,this.dirty=!1;}}class gi extends qe{getDefault(){return null}set(t){const e=this.gl;e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t),this.current=t,this.dirty=!1;}}class vi extends qe{getDefault(){return null}set(t){var e;if(t===this.current&&!this.dirty)return;const i=this.gl;Ve(i)?i.bindVertexArray(t):null===(e=i.getExtension("OES_vertex_array_object"))||void 0===e||e.bindVertexArrayOES(t),this.current=t,this.dirty=!1;}}class xi extends qe{getDefault(){return 4}set(t){if(t===this.current&&!this.dirty)return;const e=this.gl;e.pixelStorei(e.UNPACK_ALIGNMENT,t),this.current=t,this.dirty=!1;}}class yi extends qe{getDefault(){return !1}set(t){if(t===this.current&&!this.dirty)return;const e=this.gl;e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t),this.current=t,this.dirty=!1;}}class bi extends qe{getDefault(){return !1}set(t){if(t===this.current&&!this.dirty)return;const e=this.gl;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,t),this.current=t,this.dirty=!1;}}class wi extends qe{constructor(t,e){super(t),this.context=t,this.parent=e;}getDefault(){return null}}class Ti extends wi{setDirty(){this.dirty=!0;}set(t){if(t===this.current&&!this.dirty)return;this.context.bindFramebuffer.set(this.parent);const e=this.gl;e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0),this.current=t,this.dirty=!1;}}class Ei extends wi{set(t){if(t===this.current&&!this.dirty)return;this.context.bindFramebuffer.set(this.parent);const e=this.gl;e.framebufferRenderbuffer(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.RENDERBUFFER,t),this.current=t,this.dirty=!1;}}class Ii extends wi{set(t){if(t===this.current&&!this.dirty)return;this.context.bindFramebuffer.set(this.parent);const e=this.gl;e.framebufferRenderbuffer(e.FRAMEBUFFER,e.DEPTH_STENCIL_ATTACHMENT,e.RENDERBUFFER,t),this.current=t,this.dirty=!1;}}class Si{constructor(t,e,i,s,a){this.context=t,this.width=e,this.height=i;const o=t.gl,r=this.framebuffer=o.createFramebuffer();if(this.colorAttachment=new Ti(t,r),s)this.depthAttachment=a?new Ii(t,r):new Ei(t,r);else if(a)throw new Error("Stencil cannot be setted without depth");if(o.checkFramebufferStatus(o.FRAMEBUFFER)!==o.FRAMEBUFFER_COMPLETE)throw new Error("Framebuffer is not complete")}destroy(){const t=this.context.gl,e=this.colorAttachment.get();if(e&&t.deleteTexture(e),this.depthAttachment){const e=this.depthAttachment.get();e&&t.deleteRenderbuffer(e);}t.deleteFramebuffer(this.framebuffer);}}class Ci{constructor(t,e,i){this.blendFunction=t,this.blendColor=e,this.mask=i;}}Ci.Replace=[1,0],Ci.disabled=new Ci(Ci.Replace,t.Color.transparent,[!1,!1,!1,!1]),Ci.unblended=new Ci(Ci.Replace,t.Color.transparent,[!0,!0,!0,!0]),Ci.alphaBlended=new Ci([1,771],t.Color.transparent,[!0,!0,!0,!0]);class Pi{constructor(t){var e,i;if(this.gl=t,this.clearColor=new je(this),this.clearDepth=new $e(this),this.clearStencil=new Xe(this),this.colorMask=new We(this),this.depthMask=new He(this),this.stencilMask=new Ke(this),this.stencilFunc=new Ye(this),this.stencilOp=new Je(this),this.stencilTest=new Qe(this),this.depthRange=new ti(this),this.depthTest=new ei(this),this.depthFunc=new ii(this),this.blend=new si(this),this.blendFunc=new ai(this),this.blendColor=new oi(this),this.blendEquation=new ri(this),this.cullFace=new ni(this),this.cullFaceSide=new li(this),this.frontFace=new ci(this),this.program=new hi(this),this.activeTexture=new ui(this),this.viewport=new di(this),this.bindFramebuffer=new _i(this),this.bindRenderbuffer=new mi(this),this.bindTexture=new pi(this),this.bindVertexBuffer=new fi(this),this.bindElementBuffer=new gi(this),this.bindVertexArray=new vi(this),this.pixelStoreUnpack=new xi(this),this.pixelStoreUnpackPremultiplyAlpha=new yi(this),this.pixelStoreUnpackFlipY=new bi(this),this.extTextureFilterAnisotropic=t.getExtension("EXT_texture_filter_anisotropic")||t.getExtension("MOZ_EXT_texture_filter_anisotropic")||t.getExtension("WEBKIT_EXT_texture_filter_anisotropic"),this.extTextureFilterAnisotropic&&(this.extTextureFilterAnisotropicMax=t.getParameter(this.extTextureFilterAnisotropic.MAX_TEXTURE_MAX_ANISOTROPY_EXT)),this.maxTextureSize=t.getParameter(t.MAX_TEXTURE_SIZE),Ve(t)){this.HALF_FLOAT=t.HALF_FLOAT;const s=t.getExtension("EXT_color_buffer_half_float");this.RGBA16F=null!==(e=t.RGBA16F)&&void 0!==e?e:null==s?void 0:s.RGBA16F_EXT,this.RGB16F=null!==(i=t.RGB16F)&&void 0!==i?i:null==s?void 0:s.RGB16F_EXT,t.getExtension("EXT_color_buffer_float");}else {t.getExtension("EXT_color_buffer_half_float"),t.getExtension("OES_texture_half_float_linear");const e=t.getExtension("OES_texture_half_float");this.HALF_FLOAT=null==e?void 0:e.HALF_FLOAT_OES;}}setDefault(){this.unbindVAO(),this.clearColor.setDefault(),this.clearDepth.setDefault(),this.clearStencil.setDefault(),this.colorMask.setDefault(),this.depthMask.setDefault(),this.stencilMask.setDefault(),this.stencilFunc.setDefault(),this.stencilOp.setDefault(),this.stencilTest.setDefault(),this.depthRange.setDefault(),this.depthTest.setDefault(),this.depthFunc.setDefault(),this.blend.setDefault(),this.blendFunc.setDefault(),this.blendColor.setDefault(),this.blendEquation.setDefault(),this.cullFace.setDefault(),this.cullFaceSide.setDefault(),this.frontFace.setDefault(),this.program.setDefault(),this.activeTexture.setDefault(),this.bindFramebuffer.setDefault(),this.pixelStoreUnpack.setDefault(),this.pixelStoreUnpackPremultiplyAlpha.setDefault(),this.pixelStoreUnpackFlipY.setDefault();}setDirty(){this.clearColor.dirty=!0,this.clearDepth.dirty=!0,this.clearStencil.dirty=!0,this.colorMask.dirty=!0,this.depthMask.dirty=!0,this.stencilMask.dirty=!0,this.stencilFunc.dirty=!0,this.stencilOp.dirty=!0,this.stencilTest.dirty=!0,this.depthRange.dirty=!0,this.depthTest.dirty=!0,this.depthFunc.dirty=!0,this.blend.dirty=!0,this.blendFunc.dirty=!0,this.blendColor.dirty=!0,this.blendEquation.dirty=!0,this.cullFace.dirty=!0,this.cullFaceSide.dirty=!0,this.frontFace.dirty=!0,this.program.dirty=!0,this.activeTexture.dirty=!0,this.viewport.dirty=!0,this.bindFramebuffer.dirty=!0,this.bindRenderbuffer.dirty=!0,this.bindTexture.dirty=!0,this.bindVertexBuffer.dirty=!0,this.bindElementBuffer.dirty=!0,this.bindVertexArray.dirty=!0,this.pixelStoreUnpack.dirty=!0,this.pixelStoreUnpackPremultiplyAlpha.dirty=!0,this.pixelStoreUnpackFlipY.dirty=!0;}createIndexBuffer(t,e){return new Oe(this,t,e)}createVertexBuffer(t,e,i){return new Ze(this,t,e,i)}createRenderbuffer(t,e,i){const s=this.gl,a=s.createRenderbuffer();return this.bindRenderbuffer.set(a),s.renderbufferStorage(s.RENDERBUFFER,t,e,i),this.bindRenderbuffer.set(null),a}createFramebuffer(t,e,i,s){return new Si(this,t,e,i,s)}clear({color:t,depth:e,stencil:i}){const s=this.gl;let a=0;t&&(a|=s.COLOR_BUFFER_BIT,this.clearColor.set(t),this.colorMask.set([!0,!0,!0,!0])),void 0!==e&&(a|=s.DEPTH_BUFFER_BIT,this.depthRange.set([0,1]),this.clearDepth.set(e),this.depthMask.set(!0)),void 0!==i&&(a|=s.STENCIL_BUFFER_BIT,this.clearStencil.set(i),this.stencilMask.set(255)),s.clear(a);}setCullFace(t){!1===t.enable?this.cullFace.set(!1):(this.cullFace.set(!0),this.cullFaceSide.set(t.mode),this.frontFace.set(t.frontFace));}setDepthMode(t){t.func!==this.gl.ALWAYS||t.mask?(this.depthTest.set(!0),this.depthFunc.set(t.func),this.depthMask.set(t.mask),this.depthRange.set(t.range)):this.depthTest.set(!1);}setStencilMode(t){t.test.func!==this.gl.ALWAYS||t.mask?(this.stencilTest.set(!0),this.stencilMask.set(t.mask),this.stencilOp.set([t.fail,t.depthFail,t.pass]),this.stencilFunc.set({func:t.test.func,ref:t.ref,mask:t.test.mask})):this.stencilTest.set(!1);}setColorMode(e){t.deepEqual(e.blendFunction,Ci.Replace)?this.blend.set(!1):(this.blend.set(!0),this.blendFunc.set(e.blendFunction),this.blendColor.set(e.blendColor)),this.colorMask.set(e.mask);}createVertexArray(){var t;return Ve(this.gl)?this.gl.createVertexArray():null===(t=this.gl.getExtension("OES_vertex_array_object"))||void 0===t?void 0:t.createVertexArrayOES()}deleteVertexArray(t){var e;return Ve(this.gl)?this.gl.deleteVertexArray(t):null===(e=this.gl.getExtension("OES_vertex_array_object"))||void 0===e?void 0:e.deleteVertexArrayOES(t)}unbindVAO(){this.bindVertexArray.set(null);}}class Di{constructor(t,e,i){this.func=t,this.mask=e,this.range=i;}}Di.ReadOnly=!1,Di.ReadWrite=!0,Di.disabled=new Di(519,Di.ReadOnly,[0,1]);const Mi=7680;class zi{constructor(t,e,i,s,a,o){this.test=t,this.ref=e,this.mask=i,this.fail=s,this.depthFail=a,this.pass=o;}}zi.disabled=new zi({func:519,mask:0},0,0,Mi,Mi,Mi);class Ai{constructor(t,e,i){this.enable=t,this.mode=e,this.frontFace=i;}}let Li;function Ri(e,i,s,a,o,r,n){const l=e.context,c=l.gl,h=e.useProgram("collisionBox"),u=[];let d=0,_=0;for(let m=0;m<a.length;m++){const p=a[m],f=i.getTile(p),g=f.getBucket(s);if(!g)continue;let v=p.posMatrix;0===o[0]&&0===o[1]||(v=e.translatePosMatrix(p.posMatrix,f,o,r));const x=n?g.textCollisionBox:g.iconCollisionBox,y=g.collisionCircleArray;if(y.length>0){const i=t.create(),s=v;t.mul(i,g.placementInvProjMatrix,e.transform.glCoordMatrix),t.mul(i,i,g.placementViewportMatrix),u.push({circleArray:y,circleOffset:_,transform:s,invTransform:i,coord:p}),d+=y.length/4,_=d;}x&&h.draw(l,c.LINES,Di.disabled,zi.disabled,e.colorModeForRenderPass(),Ai.disabled,ye(v,e.transform,f),e.style.map.terrain&&e.style.map.terrain.getTerrainData(p),s.id,x.layoutVertexBuffer,x.indexBuffer,x.segments,null,e.transform.zoom,null,null,x.collisionVertexBuffer);}if(!n||!u.length)return;const m=e.useProgram("collisionCircle"),p=new t.CollisionCircleLayoutArray;p.resize(4*d),p._trim();let f=0;for(const t of u)for(let e=0;e<t.circleArray.length/4;e++){const i=4*e,s=t.circleArray[i+0],a=t.circleArray[i+1],o=t.circleArray[i+2],r=t.circleArray[i+3];p.emplace(f++,s,a,o,r,0),p.emplace(f++,s,a,o,r,1),p.emplace(f++,s,a,o,r,2),p.emplace(f++,s,a,o,r,3);}(!Li||Li.length<2*d)&&(Li=function(e){const i=2*e,s=new t.QuadTriangleArray;s.resize(i),s._trim();for(let t=0;t<i;t++){const e=6*t;s.uint16[e+0]=4*t+0,s.uint16[e+1]=4*t+1,s.uint16[e+2]=4*t+2,s.uint16[e+3]=4*t+2,s.uint16[e+4]=4*t+3,s.uint16[e+5]=4*t+0;}return s}(d));const g=l.createIndexBuffer(Li,!0),v=l.createVertexBuffer(p,t.collisionCircleLayout.members,!0);for(const i of u){const a={u_matrix:i.transform,u_inv_matrix:i.invTransform,u_camera_to_center_distance:(x=e.transform).cameraToCenterDistance,u_viewport_size:[x.width,x.height]};m.draw(l,c.TRIANGLES,Di.disabled,zi.disabled,e.colorModeForRenderPass(),Ai.disabled,a,e.style.map.terrain&&e.style.map.terrain.getTerrainData(i.coord),s.id,v,g,t.SegmentVector.simpleSegment(0,2*i.circleOffset,i.circleArray.length,i.circleArray.length/2),null,e.transform.zoom,null,null,null);}var x;v.destroy(),g.destroy();}Ai.disabled=new Ai(!1,1029,2305),Ai.backCCW=new Ai(!0,1029,2305);const ki=t.identity(new Float32Array(16));function Fi(e,i,s,a,o,r){const{horizontalAlign:n,verticalAlign:l}=t.getAnchorAlignment(e);return new t.Point((-(n-.5)*i/o+a[0])*r,(-(l-.5)*s/o+a[1])*r)}function Bi(e,i,s,a,o,r,n,l,c,h,u){const d=e.text.placedSymbolArray,_=e.text.dynamicLayoutVertexArray,m=e.icon.dynamicLayoutVertexArray,p={};_.clear();for(let m=0;m<d.length;m++){const f=d.get(m),g=f.hidden||!f.crossTileID||e.allowVerticalPlacement&&!f.placedOrientation?null:a[f.crossTileID];if(g){const a=new t.Point(f.anchorX,f.anchorY),d=ht(a,s?n:r,u),m=ut(o.cameraToCenterDistance,d.signedDistanceFromCamera);let v=t.evaluateSizeForFeature(e.textSizeData,c,f)*m/t.ONE_EM;s&&(v*=e.tilePixelRatio/l);const{width:x,height:y,anchor:b,textOffset:w,textBoxScale:T}=g,E=Fi(b,x,y,w,T,v),I=s?ht(a.add(E),r,u).point:d.point.add(i?E.rotate(-o.angle):E),S=e.allowVerticalPlacement&&f.placedOrientation===t.WritingMode.vertical?Math.PI/2:0;for(let e=0;e<f.numGlyphs;e++)t.addDynamicAttributes(_,I,S);h&&f.associatedIconIndex>=0&&(p[f.associatedIconIndex]={shiftedAnchor:I,angle:S});}else Tt(f.numGlyphs,_);}if(h){m.clear();const i=e.icon.placedSymbolArray;for(let e=0;e<i.length;e++){const s=i.get(e);if(s.hidden)Tt(s.numGlyphs,m);else {const i=p[e];if(i)for(let e=0;e<s.numGlyphs;e++)t.addDynamicAttributes(m,i.shiftedAnchor,i.angle);else Tt(s.numGlyphs,m);}}e.icon.dynamicLayoutVertexBuffer.updateData(m);}e.text.dynamicLayoutVertexBuffer.updateData(_);}function Ui(t,e,i){return i.iconsInText&&e?"symbolTextAndIcon":t?"symbolSDF":"symbolIcon"}function Oi(e,i,s,a,o,r,n,l,c,h,u,d){const _=e.context,m=_.gl,p=e.transform,f="map"===l,g="map"===c,v="viewport"!==l&&"point"!==s.layout.get("symbol-placement"),x=f&&!g&&!v,y=!s.layout.get("symbol-sort-key").isConstant();let b=!1;const w=e.depthModeForSublayer(0,Di.ReadOnly),T=s._unevaluatedLayout.hasValue("text-variable-anchor")||s._unevaluatedLayout.hasValue("text-variable-anchor-offset"),E=[];for(const l of a){const a=i.getTile(l),c=a.getBucket(s);if(!c)continue;const u=o?c.text:c.icon;if(!u||!u.segments.get().length||!u.hasVisibleVertices)continue;const d=u.programConfigurations.get(s.id),_=o||c.sdfIcons,w=o?c.textSizeData:c.iconSizeData,I=g||0!==p.pitch,S=e.useProgram(Ui(_,o,c),d),C=t.evaluateSizeForZoom(w,p.zoom),P=e.style.map.terrain&&e.style.map.terrain.getTerrainData(l);let D,M,z,A,L=[0,0],R=null;if(o)M=a.glyphAtlasTexture,z=m.LINEAR,D=a.glyphAtlasTexture.size,c.iconsInText&&(L=a.imageAtlasTexture.size,R=a.imageAtlasTexture,A=I||e.options.rotating||e.options.zooming||"composite"===w.kind||"camera"===w.kind?m.LINEAR:m.NEAREST);else {const t=1!==s.layout.get("icon-size").constantOr(0)||c.iconsNeedLinear;M=a.imageAtlasTexture,z=_||e.options.rotating||e.options.zooming||t||I?m.LINEAR:m.NEAREST,D=a.imageAtlasTexture.size;}const k=Ct(a,1,e.transform.zoom),F=lt(l.posMatrix,g,f,e.transform,k),B=ct(l.posMatrix,g,f,e.transform,k),U=T&&c.hasTextData(),O="none"!==s.layout.get("icon-text-fit")&&U&&c.hasIconData();if(v){const t=e.style.map.terrain?(t,i)=>e.style.map.terrain.getElevation(l,t,i):null,i="map"===s.layout.get("text-rotation-alignment");_t(c,l.posMatrix,e,o,F,B,g,h,i,t);}const N=e.translatePosMatrix(l.posMatrix,a,r,n),Z=v||o&&T||O?ki:F,G=e.translatePosMatrix(B,a,r,n,!0),V=_&&0!==s.paint.get(o?"text-halo-width":"icon-halo-width").constantOr(1);let q;q=_?c.iconsInText?ke(w.kind,C,x,g,e,N,Z,G,D,L):Re(w.kind,C,x,g,e,N,Z,G,o,D,!0):Le(w.kind,C,x,g,e,N,Z,G,o,D);const j={program:S,buffers:u,uniformValues:q,atlasTexture:M,atlasTextureIcon:R,atlasInterpolation:z,atlasInterpolationIcon:A,isSDF:_,hasHalo:V};if(y&&c.canOverlap){b=!0;const e=u.segments.get();for(const i of e)E.push({segments:new t.SegmentVector([i]),sortKey:i.sortKey,state:j,terrainData:P});}else E.push({segments:u.segments,sortKey:0,state:j,terrainData:P});}b&&E.sort(((t,e)=>t.sortKey-e.sortKey));for(const t of E){const i=t.state;if(_.activeTexture.set(m.TEXTURE0),i.atlasTexture.bind(i.atlasInterpolation,m.CLAMP_TO_EDGE),i.atlasTextureIcon&&(_.activeTexture.set(m.TEXTURE1),i.atlasTextureIcon&&i.atlasTextureIcon.bind(i.atlasInterpolationIcon,m.CLAMP_TO_EDGE)),i.isSDF){const a=i.uniformValues;i.hasHalo&&(a.u_is_halo=1,Ni(i.buffers,t.segments,s,e,i.program,w,u,d,a,t.terrainData)),a.u_is_halo=0;}Ni(i.buffers,t.segments,s,e,i.program,w,u,d,i.uniformValues,t.terrainData);}}function Ni(t,e,i,s,a,o,r,n,l,c){const h=s.context;a.draw(h,h.gl.TRIANGLES,o,r,n,Ai.disabled,l,c,i.id,t.layoutVertexBuffer,t.indexBuffer,e,i.paint,s.transform.zoom,t.programConfigurations.get(i.id),t.dynamicLayoutVertexBuffer,t.opacityVertexBuffer);}function Zi(t,e,i,s,a){if(!i||!s||!s.imageAtlas)return;const o=s.imageAtlas.patternPositions;let r=o[i.to.toString()],n=o[i.from.toString()];if(!r||!n){const t=a.getPaintProperty(e);r=o[t],n=o[t];}r&&n&&t.setConstantPatternPositions(r,n);}function Gi(t,e,i,s,a,o,r){const n=t.context.gl,l="fill-pattern",c=i.paint.get(l),h=c&&c.constantOr(1),u=i.getCrossfadeParameters();let d,_,m,p,f;r?(_=h&&!i.getPaintProperty("fill-outline-color")?"fillOutlinePattern":"fillOutline",d=n.LINES):(_=h?"fillPattern":"fill",d=n.TRIANGLES);const g=c.constantOr(null);for(const c of s){const s=e.getTile(c);if(h&&!s.patternsLoaded())continue;const v=s.getBucket(i);if(!v)continue;const x=v.programConfigurations.get(i.id),y=t.useProgram(_,x),b=t.style.map.terrain&&t.style.map.terrain.getTerrainData(c);h&&(t.context.activeTexture.set(n.TEXTURE0),s.imageAtlasTexture.bind(n.LINEAR,n.CLAMP_TO_EDGE),x.updatePaintBuffers(u)),Zi(x,l,g,s,i);const w=b?c:null,T=t.translatePosMatrix(w?w.posMatrix:c.posMatrix,s,i.paint.get("fill-translate"),i.paint.get("fill-translate-anchor"));if(r){p=v.indexBuffer2,f=v.segments2;const e=[n.drawingBufferWidth,n.drawingBufferHeight];m="fillOutlinePattern"===_&&h?ve(T,t,u,s,e):ge(T,e);}else p=v.indexBuffer,f=v.segments,m=h?fe(T,t,u,s):pe(T);y.draw(t.context,d,a,t.stencilModeForClipping(c),o,Ai.disabled,m,b,i.id,v.layoutVertexBuffer,p,f,i.paint,t.transform.zoom,x);}}function Vi(t,e,i,s,a,o,r){const n=t.context,l=n.gl,c="fill-extrusion-pattern",h=i.paint.get(c),u=h.constantOr(1),d=i.getCrossfadeParameters(),_=i.paint.get("fill-extrusion-opacity"),m=h.constantOr(null);for(const h of s){const s=e.getTile(h),p=s.getBucket(i);if(!p)continue;const f=t.style.map.terrain&&t.style.map.terrain.getTerrainData(h),g=p.programConfigurations.get(i.id),v=t.useProgram(u?"fillExtrusionPattern":"fillExtrusion",g);u&&(t.context.activeTexture.set(l.TEXTURE0),s.imageAtlasTexture.bind(l.LINEAR,l.CLAMP_TO_EDGE),g.updatePaintBuffers(d)),Zi(g,c,m,s,i);const x=t.translatePosMatrix(h.posMatrix,s,i.paint.get("fill-extrusion-translate"),i.paint.get("fill-extrusion-translate-anchor")),y=i.paint.get("fill-extrusion-vertical-gradient"),b=u?me(x,t,y,_,h,d,s):_e(x,t,y,_);v.draw(n,n.gl.TRIANGLES,a,o,r,Ai.backCCW,b,f,i.id,p.layoutVertexBuffer,p.indexBuffer,p.segments,i.paint,t.transform.zoom,g,t.style.map.terrain&&p.centroidVertexBuffer);}}function qi(t,e,i,s,a,o,r){const n=t.context,l=n.gl,c=i.fbo;if(!c)return;const h=t.useProgram("hillshade"),u=t.style.map.terrain&&t.style.map.terrain.getTerrainData(e);n.activeTexture.set(l.TEXTURE0),l.bindTexture(l.TEXTURE_2D,c.colorAttachment.get()),h.draw(n,l.TRIANGLES,a,o,r,Ai.disabled,((t,e,i,s)=>{const a=i.paint.get("hillshade-shadow-color"),o=i.paint.get("hillshade-highlight-color"),r=i.paint.get("hillshade-accent-color");let n=i.paint.get("hillshade-illumination-direction")*(Math.PI/180);"viewport"===i.paint.get("hillshade-illumination-anchor")&&(n-=t.transform.angle);const l=!t.options.moving;return {u_matrix:s?s.posMatrix:t.transform.calculatePosMatrix(e.tileID.toUnwrapped(),l),u_image:0,u_latrange:Ee(0,e.tileID),u_light:[i.paint.get("hillshade-exaggeration"),n],u_shadow:a,u_highlight:o,u_accent:r}})(t,i,s,u?e:null),u,s.id,t.rasterBoundsBuffer,t.quadTriangleIndexBuffer,t.rasterBoundsSegments);}function ji(e,i,s,a,o,r){const n=e.context,l=n.gl,c=i.dem;if(c&&c.data){const h=c.dim,u=c.stride,d=c.getPixels();if(n.activeTexture.set(l.TEXTURE1),n.pixelStoreUnpackPremultiplyAlpha.set(!1),i.demTexture=i.demTexture||e.getTileTexture(u),i.demTexture){const t=i.demTexture;t.update(d,{premultiply:!1}),t.bind(l.NEAREST,l.CLAMP_TO_EDGE);}else i.demTexture=new x(n,d,l.RGBA,{premultiply:!1}),i.demTexture.bind(l.NEAREST,l.CLAMP_TO_EDGE);n.activeTexture.set(l.TEXTURE0);let _=i.fbo;if(!_){const t=new x(n,{width:h,height:h,data:null},l.RGBA);t.bind(l.LINEAR,l.CLAMP_TO_EDGE),_=i.fbo=n.createFramebuffer(h,h,!0,!1),_.colorAttachment.set(t.texture);}n.bindFramebuffer.set(_.framebuffer),n.viewport.set([0,0,h,h]),e.useProgram("hillshadePrepare").draw(n,l.TRIANGLES,a,o,r,Ai.disabled,((e,i)=>{const s=i.stride,a=t.create();return t.ortho(a,0,t.EXTENT,-t.EXTENT,0,0,1),t.translate(a,a,[0,-t.EXTENT,0]),{u_matrix:a,u_image:1,u_dimension:[s,s],u_zoom:e.overscaledZ,u_unpack:i.getUnpackVector()}})(i.tileID,c),null,s.id,e.rasterBoundsBuffer,e.quadTriangleIndexBuffer,e.rasterBoundsSegments),i.needsHillshadePrepare=!1;}}function $i(e,i,s,a,o,r){const n=a.paint.get("raster-fade-duration");if(!r&&n>0){const a=t.browser.now(),r=(a-e.timeAdded)/n,l=i?(a-i.timeAdded)/n:-1,c=s.getSource(),h=o.coveringZoomLevel({tileSize:c.tileSize,roundZoom:c.roundZoom}),u=!i||Math.abs(i.tileID.overscaledZ-h)>Math.abs(e.tileID.overscaledZ-h),d=u&&e.refreshedUponExpiration?1:t.clamp(u?r:1-l,0,1);return e.refreshedUponExpiration&&r>=1&&(e.refreshedUponExpiration=!1),i?{opacity:1,mix:1-d}:{opacity:d,mix:0}}return {opacity:1,mix:0}}const Xi=new t.Color(1,0,0,1),Wi=new t.Color(0,1,0,1),Hi=new t.Color(0,0,1,1),Ki=new t.Color(1,0,1,1),Yi=new t.Color(0,1,1,1);function Ji(t,e,i,s){ts(t,0,e+i/2,t.transform.width,i,s);}function Qi(t,e,i,s){ts(t,e-i/2,0,i,t.transform.height,s);}function ts(t,e,i,s,a,o){const r=t.context,n=r.gl;n.enable(n.SCISSOR_TEST),n.scissor(e*t.pixelRatio,i*t.pixelRatio,s*t.pixelRatio,a*t.pixelRatio),r.clear({color:o}),n.disable(n.SCISSOR_TEST);}function es(e,i,s){const a=e.context,o=a.gl,r=s.posMatrix,n=e.useProgram("debug"),l=Di.disabled,c=zi.disabled,h=e.colorModeForRenderPass(),u="$debug",d=e.style.map.terrain&&e.style.map.terrain.getTerrainData(s);a.activeTexture.set(o.TEXTURE0);const _=i.getTileByID(s.key).latestRawTileData,m=Math.floor((_&&_.byteLength||0)/1024),p=i.getTile(s).tileSize,f=512/Math.min(p,512)*(s.overscaledZ/e.transform.zoom)*.5;let g=s.canonical.toString();s.overscaledZ!==s.canonical.z&&(g+=` => ${s.overscaledZ}`),function(t,e){t.initDebugOverlayCanvas();const i=t.debugOverlayCanvas,s=t.context.gl,a=t.debugOverlayCanvas.getContext("2d");a.clearRect(0,0,i.width,i.height),a.shadowColor="white",a.shadowBlur=2,a.lineWidth=1.5,a.strokeStyle="white",a.textBaseline="top",a.font="bold 36px Open Sans, sans-serif",a.fillText(e,5,5),a.strokeText(e,5,5),t.debugOverlayTexture.update(i),t.debugOverlayTexture.bind(s.LINEAR,s.CLAMP_TO_EDGE);}(e,`${g} ${m}kB`),n.draw(a,o.TRIANGLES,l,c,Ci.alphaBlended,Ai.disabled,be(r,t.Color.transparent,f),null,u,e.debugBuffer,e.quadTriangleIndexBuffer,e.debugSegments),n.draw(a,o.LINE_STRIP,l,c,h,Ai.disabled,be(r,t.Color.red),d,u,e.debugBuffer,e.tileBorderIndexBuffer,e.debugSegments);}function is(t,e,i){const s=t.context,a=s.gl,o=t.colorModeForRenderPass(),r=new Di(a.LEQUAL,Di.ReadWrite,t.depthRangeFor3D),n=t.useProgram("terrain"),l=e.getTerrainMesh();s.bindFramebuffer.set(null),s.viewport.set([0,0,t.width,t.height]);for(const c of i){const i=t.renderToTexture.getTexture(c),h=e.getTerrainData(c.tileID);s.activeTexture.set(a.TEXTURE0),a.bindTexture(a.TEXTURE_2D,i.texture);const u={u_matrix:t.transform.calculatePosMatrix(c.tileID.toUnwrapped()),u_texture:0,u_ele_delta:e.getMeshFrameDelta(t.transform.zoom)};n.draw(s,a.TRIANGLES,r,zi.disabled,o,Ai.backCCW,u,h,"terrain",l.vertexBuffer,l.indexBuffer,l.segments);}}class ss{constructor(e,i){this.context=new Pi(e),this.transform=i,this._tileTextures={},this.terrainFacilitator={dirty:!0,matrix:t.create(),renderTime:0},this.setup(),this.numSublayers=Y.maxUnderzooming+Y.maxOverzooming+1,this.depthEpsilon=1/Math.pow(2,16),this.crossTileSymbolIndex=new Qt;}resize(t,e,i){if(this.width=Math.floor(t*i),this.height=Math.floor(e*i),this.pixelRatio=i,this.context.viewport.set([0,0,this.width,this.height]),this.style)for(const t of this.style._order)this.style._layers[t].resize();}setup(){const e=this.context,i=new t.PosArray;i.emplaceBack(0,0),i.emplaceBack(t.EXTENT,0),i.emplaceBack(0,t.EXTENT),i.emplaceBack(t.EXTENT,t.EXTENT),this.tileExtentBuffer=e.createVertexBuffer(i,oe.members),this.tileExtentSegments=t.SegmentVector.simpleSegment(0,0,4,2);const s=new t.PosArray;s.emplaceBack(0,0),s.emplaceBack(t.EXTENT,0),s.emplaceBack(0,t.EXTENT),s.emplaceBack(t.EXTENT,t.EXTENT),this.debugBuffer=e.createVertexBuffer(s,oe.members),this.debugSegments=t.SegmentVector.simpleSegment(0,0,4,5);const a=new t.RasterBoundsArray;a.emplaceBack(0,0,0,0),a.emplaceBack(t.EXTENT,0,t.EXTENT,0),a.emplaceBack(0,t.EXTENT,0,t.EXTENT),a.emplaceBack(t.EXTENT,t.EXTENT,t.EXTENT,t.EXTENT),this.rasterBoundsBuffer=e.createVertexBuffer(a,O.members),this.rasterBoundsSegments=t.SegmentVector.simpleSegment(0,0,4,2);const o=new t.PosArray;o.emplaceBack(0,0),o.emplaceBack(1,0),o.emplaceBack(0,1),o.emplaceBack(1,1),this.viewportBuffer=e.createVertexBuffer(o,oe.members),this.viewportSegments=t.SegmentVector.simpleSegment(0,0,4,2);const r=new t.LineStripIndexArray;r.emplaceBack(0),r.emplaceBack(1),r.emplaceBack(3),r.emplaceBack(2),r.emplaceBack(0),this.tileBorderIndexBuffer=e.createIndexBuffer(r);const n=new t.TriangleIndexArray;n.emplaceBack(0,1,2),n.emplaceBack(2,1,3),this.quadTriangleIndexBuffer=e.createIndexBuffer(n);const l=this.context.gl;this.stencilClearMode=new zi({func:l.ALWAYS,mask:0},0,255,l.ZERO,l.ZERO,l.ZERO);}clearStencil(){const e=this.context,i=e.gl;this.nextStencilID=1,this.currentStencilSource=void 0;const s=t.create();t.ortho(s,0,this.width,this.height,0,0,1),t.scale(s,s,[i.drawingBufferWidth,i.drawingBufferHeight,0]),this.useProgram("clippingMask").draw(e,i.TRIANGLES,Di.disabled,this.stencilClearMode,Ci.disabled,Ai.disabled,we(s),null,"$clipping",this.viewportBuffer,this.quadTriangleIndexBuffer,this.viewportSegments);}_renderTileClippingMasks(t,e){if(this.currentStencilSource===t.source||!t.isTileClipped()||!e||!e.length)return;this.currentStencilSource=t.source;const i=this.context,s=i.gl;this.nextStencilID+e.length>256&&this.clearStencil(),i.setColorMode(Ci.disabled),i.setDepthMode(Di.disabled);const a=this.useProgram("clippingMask");this._tileClippingMaskIDs={};for(const t of e){const e=this._tileClippingMaskIDs[t.key]=this.nextStencilID++,o=this.style.map.terrain&&this.style.map.terrain.getTerrainData(t);a.draw(i,s.TRIANGLES,Di.disabled,new zi({func:s.ALWAYS,mask:0},e,255,s.KEEP,s.KEEP,s.REPLACE),Ci.disabled,Ai.disabled,we(t.posMatrix),o,"$clipping",this.tileExtentBuffer,this.quadTriangleIndexBuffer,this.tileExtentSegments);}}stencilModeFor3D(){this.currentStencilSource=void 0,this.nextStencilID+1>256&&this.clearStencil();const t=this.nextStencilID++,e=this.context.gl;return new zi({func:e.NOTEQUAL,mask:255},t,255,e.KEEP,e.KEEP,e.REPLACE)}stencilModeForClipping(t){const e=this.context.gl;return new zi({func:e.EQUAL,mask:255},this._tileClippingMaskIDs[t.key],0,e.KEEP,e.KEEP,e.REPLACE)}stencilConfigForOverlap(t){const e=this.context.gl,i=t.sort(((t,e)=>e.overscaledZ-t.overscaledZ)),s=i[i.length-1].overscaledZ,a=i[0].overscaledZ-s+1;if(a>1){this.currentStencilSource=void 0,this.nextStencilID+a>256&&this.clearStencil();const t={};for(let i=0;i<a;i++)t[i+s]=new zi({func:e.GEQUAL,mask:255},i+this.nextStencilID,255,e.KEEP,e.KEEP,e.REPLACE);return this.nextStencilID+=a,[t,i]}return [{[s]:zi.disabled},i]}colorModeForRenderPass(){const e=this.context.gl;if(this._showOverdrawInspector){const i=1/8;return new Ci([e.CONSTANT_COLOR,e.ONE],new t.Color(i,i,i,0),[!0,!0,!0,!0])}return "opaque"===this.renderPass?Ci.unblended:Ci.alphaBlended}depthModeForSublayer(t,e,i){if(!this.opaquePassEnabledForLayer())return Di.disabled;const s=1-((1+this.currentLayer)*this.numSublayers+t)*this.depthEpsilon;return new Di(i||this.context.gl.LEQUAL,e,[s,s])}opaquePassEnabledForLayer(){return this.currentLayer<this.opaquePassCutoff}render(e,i){this.style=e,this.options=i,this.lineAtlas=e.lineAtlas,this.imageManager=e.imageManager,this.glyphManager=e.glyphManager,this.symbolFadeChange=e.placement.symbolFadeChange(t.browser.now()),this.imageManager.beginFrame();const s=this.style._order,a=this.style.sourceCaches,o={},r={},n={};for(const t in a){const e=a[t];e.used&&e.prepare(this.context),o[t]=e.getVisibleCoordinates(),r[t]=o[t].slice().reverse(),n[t]=e.getVisibleCoordinates(!0).reverse();}this.opaquePassCutoff=1/0;for(let t=0;t<s.length;t++)if(this.style._layers[s[t]].is3D()){this.opaquePassCutoff=t;break}if(this.renderToTexture){this.renderToTexture.prepareForRender(this.style,this.transform.zoom),this.opaquePassCutoff=0;const e=this.style.map.terrain.sourceCache.tilesAfterTime(this.terrainFacilitator.renderTime);(this.terrainFacilitator.dirty||!t.equals(this.terrainFacilitator.matrix,this.transform.projMatrix)||e.length)&&(t.copy(this.terrainFacilitator.matrix,this.transform.projMatrix),this.terrainFacilitator.renderTime=Date.now(),this.terrainFacilitator.dirty=!1,function(e,i){const s=e.context,a=s.gl,o=Ci.unblended,r=new Di(a.LEQUAL,Di.ReadWrite,[0,1]),n=i.getTerrainMesh(),l=i.sourceCache.getRenderableTiles(),c=e.useProgram("terrainDepth");s.bindFramebuffer.set(i.getFramebuffer("depth").framebuffer),s.viewport.set([0,0,e.width/devicePixelRatio,e.height/devicePixelRatio]),s.clear({color:t.Color.transparent,depth:1});for(const t of l){const l=i.getTerrainData(t.tileID),h={u_matrix:e.transform.calculatePosMatrix(t.tileID.toUnwrapped()),u_ele_delta:i.getMeshFrameDelta(e.transform.zoom)};c.draw(s,a.TRIANGLES,r,zi.disabled,o,Ai.backCCW,h,l,"terrain",n.vertexBuffer,n.indexBuffer,n.segments);}s.bindFramebuffer.set(null),s.viewport.set([0,0,e.width,e.height]);}(this,this.style.map.terrain),function(e,i){const s=e.context,a=s.gl,o=Ci.unblended,r=new Di(a.LEQUAL,Di.ReadWrite,[0,1]),n=i.getTerrainMesh(),l=i.getCoordsTexture(),c=i.sourceCache.getRenderableTiles(),h=e.useProgram("terrainCoords");s.bindFramebuffer.set(i.getFramebuffer("coords").framebuffer),s.viewport.set([0,0,e.width/devicePixelRatio,e.height/devicePixelRatio]),s.clear({color:t.Color.transparent,depth:1}),i.coordsIndex=[];for(const t of c){const c=i.getTerrainData(t.tileID);s.activeTexture.set(a.TEXTURE0),a.bindTexture(a.TEXTURE_2D,l.texture);const u={u_matrix:e.transform.calculatePosMatrix(t.tileID.toUnwrapped()),u_terrain_coords_id:(255-i.coordsIndex.length)/255,u_texture:0,u_ele_delta:i.getMeshFrameDelta(e.transform.zoom)};h.draw(s,a.TRIANGLES,r,zi.disabled,o,Ai.backCCW,u,c,"terrain",n.vertexBuffer,n.indexBuffer,n.segments),i.coordsIndex.push(t.tileID.key);}s.bindFramebuffer.set(null),s.viewport.set([0,0,e.width,e.height]);}(this,this.style.map.terrain));}this.renderPass="offscreen";for(const t of s){const e=this.style._layers[t];if(!e.hasOffscreenPass()||e.isHidden(this.transform.zoom))continue;const i=r[e.source];("custom"===e.type||i.length)&&this.renderLayer(this,a[e.source],e,i);}if(this.context.bindFramebuffer.set(null),this.context.clear({color:i.showOverdrawInspector?t.Color.black:t.Color.transparent,depth:1}),this.clearStencil(),this._showOverdrawInspector=i.showOverdrawInspector,this.depthRangeFor3D=[0,1-(e._order.length+2)*this.numSublayers*this.depthEpsilon],!this.renderToTexture)for(this.renderPass="opaque",this.currentLayer=s.length-1;this.currentLayer>=0;this.currentLayer--){const t=this.style._layers[s[this.currentLayer]],e=a[t.source],i=o[t.source];this._renderTileClippingMasks(t,i),this.renderLayer(this,e,t,i);}for(this.renderPass="translucent",this.currentLayer=0;this.currentLayer<s.length;this.currentLayer++){const t=this.style._layers[s[this.currentLayer]],e=a[t.source];if(this.renderToTexture&&this.renderToTexture.renderLayer(t))continue;const i=("symbol"===t.type?n:r)[t.source];this._renderTileClippingMasks(t,o[t.source]),this.renderLayer(this,e,t,i);}if(this.options.showTileBoundaries){const t=function(t,e){let i=null;const s=Object.values(t._layers).flatMap((i=>i.source&&!i.isHidden(e)?[t.sourceCaches[i.source]]:[])),a=s.filter((t=>"vector"===t.getSource().type)),o=s.filter((t=>"vector"!==t.getSource().type)),r=t=>{(!i||i.getSource().maxzoom<t.getSource().maxzoom)&&(i=t);};return a.forEach((t=>r(t))),i||o.forEach((t=>r(t))),i}(this.style,this.transform.zoom);t&&function(t,e,i){for(let s=0;s<i.length;s++)es(t,e,i[s]);}(this,t,t.getVisibleCoordinates());}this.options.showPadding&&function(t){const e=t.transform.padding;Ji(t,t.transform.height-(e.top||0),3,Xi),Ji(t,e.bottom||0,3,Wi),Qi(t,e.left||0,3,Hi),Qi(t,t.transform.width-(e.right||0),3,Ki);const i=t.transform.centerPoint;!function(t,e,i,s){ts(t,e-1,i-10,2,20,s),ts(t,e-10,i-1,20,2,s);}(t,i.x,t.transform.height-i.y,Yi);}(this),this.context.setDefault();}renderLayer(e,i,s,a){if(!s.isHidden(this.transform.zoom)&&("background"===s.type||"custom"===s.type||(a||[]).length))switch(this.id=s.id,s.type){case"symbol":!function(e,i,s,a,o){if("translucent"!==e.renderPass)return;const r=zi.disabled,n=e.colorModeForRenderPass();(s._unevaluatedLayout.hasValue("text-variable-anchor")||s._unevaluatedLayout.hasValue("text-variable-anchor-offset"))&&function(e,i,s,a,o,r,n){const l=i.transform,c="map"===o,h="map"===r;for(const o of e){const e=a.getTile(o),r=e.getBucket(s);if(!r||!r.text||!r.text.segments.get().length)continue;const u=t.evaluateSizeForZoom(r.textSizeData,l.zoom),d=Ct(e,1,i.transform.zoom),_=lt(o.posMatrix,h,c,i.transform,d),m="none"!==s.layout.get("icon-text-fit")&&r.hasIconData();if(u){const t=Math.pow(2,l.zoom-e.tileID.overscaledZ);Bi(r,c,h,n,l,_,o.posMatrix,t,u,m,i.style.map.terrain?(t,e)=>i.style.map.terrain.getElevation(o,t,e):null);}}}(a,e,s,i,s.layout.get("text-rotation-alignment"),s.layout.get("text-pitch-alignment"),o),0!==s.paint.get("icon-opacity").constantOr(1)&&Oi(e,i,s,a,!1,s.paint.get("icon-translate"),s.paint.get("icon-translate-anchor"),s.layout.get("icon-rotation-alignment"),s.layout.get("icon-pitch-alignment"),s.layout.get("icon-keep-upright"),r,n),0!==s.paint.get("text-opacity").constantOr(1)&&Oi(e,i,s,a,!0,s.paint.get("text-translate"),s.paint.get("text-translate-anchor"),s.layout.get("text-rotation-alignment"),s.layout.get("text-pitch-alignment"),s.layout.get("text-keep-upright"),r,n),i.map.showCollisionBoxes&&(Ri(e,i,s,a,s.paint.get("text-translate"),s.paint.get("text-translate-anchor"),!0),Ri(e,i,s,a,s.paint.get("icon-translate"),s.paint.get("icon-translate-anchor"),!1));}(e,i,s,a,this.style.placement.variableOffsets);break;case"circle":!function(e,i,s,a){if("translucent"!==e.renderPass)return;const o=s.paint.get("circle-opacity"),r=s.paint.get("circle-stroke-width"),n=s.paint.get("circle-stroke-opacity"),l=!s.layout.get("circle-sort-key").isConstant();if(0===o.constantOr(1)&&(0===r.constantOr(1)||0===n.constantOr(1)))return;const c=e.context,h=c.gl,u=e.depthModeForSublayer(0,Di.ReadOnly),d=zi.disabled,_=e.colorModeForRenderPass(),m=[];for(let o=0;o<a.length;o++){const r=a[o],n=i.getTile(r),c=n.getBucket(s);if(!c)continue;const h=c.programConfigurations.get(s.id),u=e.useProgram("circle",h),d=c.layoutVertexBuffer,_=c.indexBuffer,p=e.style.map.terrain&&e.style.map.terrain.getTerrainData(r),f={programConfiguration:h,program:u,layoutVertexBuffer:d,indexBuffer:_,uniformValues:xe(e,r,n,s),terrainData:p};if(l){const e=c.segments.get();for(const i of e)m.push({segments:new t.SegmentVector([i]),sortKey:i.sortKey,state:f});}else m.push({segments:c.segments,sortKey:0,state:f});}l&&m.sort(((t,e)=>t.sortKey-e.sortKey));for(const t of m){const{programConfiguration:i,program:a,layoutVertexBuffer:o,indexBuffer:r,uniformValues:n,terrainData:l}=t.state;a.draw(c,h.TRIANGLES,u,d,_,Ai.disabled,n,l,s.id,o,r,t.segments,s.paint,e.transform.zoom,i);}}(e,i,s,a);break;case"heatmap":!function(e,i,s,a){if(0!==s.paint.get("heatmap-opacity"))if("offscreen"===e.renderPass){const o=e.context,r=o.gl,n=zi.disabled,l=new Ci([r.ONE,r.ONE],t.Color.transparent,[!0,!0,!0,!0]);!function(t,e,i){const s=t.gl;t.activeTexture.set(s.TEXTURE1),t.viewport.set([0,0,e.width/4,e.height/4]);let a=i.heatmapFbo;if(a)s.bindTexture(s.TEXTURE_2D,a.colorAttachment.get()),t.bindFramebuffer.set(a.framebuffer);else {const o=s.createTexture();s.bindTexture(s.TEXTURE_2D,o),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_S,s.CLAMP_TO_EDGE),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_T,s.CLAMP_TO_EDGE),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MIN_FILTER,s.LINEAR),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MAG_FILTER,s.LINEAR),a=i.heatmapFbo=t.createFramebuffer(e.width/4,e.height/4,!1,!1),function(t,e,i,s){var a,o;const r=t.gl,n=null!==(a=t.HALF_FLOAT)&&void 0!==a?a:r.UNSIGNED_BYTE,l=null!==(o=t.RGBA16F)&&void 0!==o?o:r.RGBA;r.texImage2D(r.TEXTURE_2D,0,l,e.width/4,e.height/4,0,r.RGBA,n,null),s.colorAttachment.set(i);}(t,e,o,a);}}(o,e,s),o.clear({color:t.Color.transparent});for(let t=0;t<a.length;t++){const c=a[t];if(i.hasRenderableParent(c))continue;const h=i.getTile(c),u=h.getBucket(s);if(!u)continue;const d=u.programConfigurations.get(s.id),_=e.useProgram("heatmap",d),{zoom:m}=e.transform;_.draw(o,r.TRIANGLES,Di.disabled,n,l,Ai.disabled,Te(c.posMatrix,h,m,s.paint.get("heatmap-intensity")),null,s.id,u.layoutVertexBuffer,u.indexBuffer,u.segments,s.paint,e.transform.zoom,d);}o.viewport.set([0,0,e.width,e.height]);}else "translucent"===e.renderPass&&(e.context.setColorMode(e.colorModeForRenderPass()),function(e,i){const s=e.context,a=s.gl,o=i.heatmapFbo;if(!o)return;s.activeTexture.set(a.TEXTURE0),a.bindTexture(a.TEXTURE_2D,o.colorAttachment.get()),s.activeTexture.set(a.TEXTURE1);let r=i.colorRampTexture;r||(r=i.colorRampTexture=new x(s,i.colorRamp,a.RGBA)),r.bind(a.LINEAR,a.CLAMP_TO_EDGE),e.useProgram("heatmapTexture").draw(s,a.TRIANGLES,Di.disabled,zi.disabled,e.colorModeForRenderPass(),Ai.disabled,((e,i,s,a)=>{const o=t.create();t.ortho(o,0,e.width,e.height,0,0,1);const r=e.context.gl;return {u_matrix:o,u_world:[r.drawingBufferWidth,r.drawingBufferHeight],u_image:0,u_color_ramp:1,u_opacity:i.paint.get("heatmap-opacity")}})(e,i),null,i.id,e.viewportBuffer,e.quadTriangleIndexBuffer,e.viewportSegments,i.paint,e.transform.zoom);}(e,s));}(e,i,s,a);break;case"line":!function(e,i,s,a){if("translucent"!==e.renderPass)return;const o=s.paint.get("line-opacity"),r=s.paint.get("line-width");if(0===o.constantOr(1)||0===r.constantOr(1))return;const n=e.depthModeForSublayer(0,Di.ReadOnly),l=e.colorModeForRenderPass(),c=s.paint.get("line-dasharray"),h=s.paint.get("line-pattern"),u=h.constantOr(1),d=s.paint.get("line-gradient"),_=s.getCrossfadeParameters(),m=u?"linePattern":c?"lineSDF":d?"lineGradient":"line",p=e.context,f=p.gl;let g=!0;for(const o of a){const a=i.getTile(o);if(u&&!a.patternsLoaded())continue;const r=a.getBucket(s);if(!r)continue;const v=r.programConfigurations.get(s.id),y=e.context.program.get(),b=e.useProgram(m,v),w=g||b.program!==y,T=e.style.map.terrain&&e.style.map.terrain.getTerrainData(o),E=h.constantOr(null);if(E&&a.imageAtlas){const t=a.imageAtlas,e=t.patternPositions[E.to.toString()],i=t.patternPositions[E.from.toString()];e&&i&&v.setConstantPatternPositions(e,i);}const I=T?o:null,S=u?Ce(e,a,s,_,I):c?Pe(e,a,s,c,_,I):d?Se(e,a,s,r.lineClipsArray.length,I):Ie(e,a,s,I);if(u)p.activeTexture.set(f.TEXTURE0),a.imageAtlasTexture.bind(f.LINEAR,f.CLAMP_TO_EDGE),v.updatePaintBuffers(_);else if(c&&(w||e.lineAtlas.dirty))p.activeTexture.set(f.TEXTURE0),e.lineAtlas.bind(p);else if(d){const a=r.gradients[s.id];let n=a.texture;if(s.gradientVersion!==a.version){let l=256;if(s.stepInterpolant){const s=i.getSource().maxzoom,a=o.canonical.z===s?Math.ceil(1<<e.transform.maxZoom-o.canonical.z):1;l=t.clamp(t.nextPowerOfTwo(r.maxLineLength/t.EXTENT*1024*a),256,p.maxTextureSize);}a.gradient=t.renderColorRamp({expression:s.gradientExpression(),evaluationKey:"lineProgress",resolution:l,image:a.gradient||void 0,clips:r.lineClipsArray}),a.texture?a.texture.update(a.gradient):a.texture=new x(p,a.gradient,f.RGBA),a.version=s.gradientVersion,n=a.texture;}p.activeTexture.set(f.TEXTURE0),n.bind(s.stepInterpolant?f.NEAREST:f.LINEAR,f.CLAMP_TO_EDGE);}b.draw(p,f.TRIANGLES,n,e.stencilModeForClipping(o),l,Ai.disabled,S,T,s.id,r.layoutVertexBuffer,r.indexBuffer,r.segments,s.paint,e.transform.zoom,v,r.layoutVertexBuffer2),g=!1;}}(e,i,s,a);break;case"fill":!function(e,i,s,a){const o=s.paint.get("fill-color"),r=s.paint.get("fill-opacity");if(0===r.constantOr(1))return;const n=e.colorModeForRenderPass(),l=s.paint.get("fill-pattern"),c=e.opaquePassEnabledForLayer()&&!l.constantOr(1)&&1===o.constantOr(t.Color.transparent).a&&1===r.constantOr(0)?"opaque":"translucent";if(e.renderPass===c){const t=e.depthModeForSublayer(1,"opaque"===e.renderPass?Di.ReadWrite:Di.ReadOnly);Gi(e,i,s,a,t,n,!1);}if("translucent"===e.renderPass&&s.paint.get("fill-antialias")){const t=e.depthModeForSublayer(s.getPaintProperty("fill-outline-color")?2:0,Di.ReadOnly);Gi(e,i,s,a,t,n,!0);}}(e,i,s,a);break;case"fill-extrusion":!function(t,e,i,s){const a=i.paint.get("fill-extrusion-opacity");if(0!==a&&"translucent"===t.renderPass){const o=new Di(t.context.gl.LEQUAL,Di.ReadWrite,t.depthRangeFor3D);if(1!==a||i.paint.get("fill-extrusion-pattern").constantOr(1))Vi(t,e,i,s,o,zi.disabled,Ci.disabled),Vi(t,e,i,s,o,t.stencilModeFor3D(),t.colorModeForRenderPass());else {const a=t.colorModeForRenderPass();Vi(t,e,i,s,o,zi.disabled,a);}}}(e,i,s,a);break;case"hillshade":!function(t,e,i,s){if("offscreen"!==t.renderPass&&"translucent"!==t.renderPass)return;const a=t.context,o=t.depthModeForSublayer(0,Di.ReadOnly),r=t.colorModeForRenderPass(),[n,l]="translucent"===t.renderPass?t.stencilConfigForOverlap(s):[{},s];for(const s of l){const a=e.getTile(s);void 0!==a.needsHillshadePrepare&&a.needsHillshadePrepare&&"offscreen"===t.renderPass?ji(t,a,i,o,zi.disabled,r):"translucent"===t.renderPass&&qi(t,s,a,i,o,n[s.overscaledZ],r);}a.viewport.set([0,0,t.width,t.height]);}(e,i,s,a);break;case"raster":!function(t,e,i,s){if("translucent"!==t.renderPass)return;if(0===i.paint.get("raster-opacity"))return;if(!s.length)return;const a=t.context,o=a.gl,r=e.getSource(),n=t.useProgram("raster"),l=t.colorModeForRenderPass(),[c,h]=r instanceof N?[{},s]:t.stencilConfigForOverlap(s),u=h[h.length-1].overscaledZ,d=!t.options.moving;for(const s of h){const h=t.depthModeForSublayer(s.overscaledZ-u,1===i.paint.get("raster-opacity")?Di.ReadWrite:Di.ReadOnly,o.LESS),_=e.getTile(s);_.registerFadeDuration(i.paint.get("raster-fade-duration"));const m=e.findLoadedParent(s,0),p=$i(_,m,e,i,t.transform,t.style.map.terrain);let f,g;const v="nearest"===i.paint.get("raster-resampling")?o.NEAREST:o.LINEAR;a.activeTexture.set(o.TEXTURE0),_.texture.bind(v,o.CLAMP_TO_EDGE,o.LINEAR_MIPMAP_NEAREST),a.activeTexture.set(o.TEXTURE1),m?(m.texture.bind(v,o.CLAMP_TO_EDGE,o.LINEAR_MIPMAP_NEAREST),f=Math.pow(2,m.tileID.overscaledZ-_.tileID.overscaledZ),g=[_.tileID.canonical.x*f%1,_.tileID.canonical.y*f%1]):_.texture.bind(v,o.CLAMP_TO_EDGE,o.LINEAR_MIPMAP_NEAREST);const x=t.style.map.terrain&&t.style.map.terrain.getTerrainData(s),y=x?s:null,b=y?y.posMatrix:t.transform.calculatePosMatrix(s.toUnwrapped(),d),w=ze(b,g||[0,0],f||1,p,i);r instanceof N?n.draw(a,o.TRIANGLES,h,zi.disabled,l,Ai.disabled,w,x,i.id,r.boundsBuffer,t.quadTriangleIndexBuffer,r.boundsSegments):n.draw(a,o.TRIANGLES,h,c[s.overscaledZ],l,Ai.disabled,w,x,i.id,t.rasterBoundsBuffer,t.quadTriangleIndexBuffer,t.rasterBoundsSegments);}}(e,i,s,a);break;case"background":!function(t,e,i,s){const a=i.paint.get("background-color"),o=i.paint.get("background-opacity");if(0===o)return;const r=t.context,n=r.gl,l=t.transform,c=l.tileSize,h=i.paint.get("background-pattern");if(t.isPatternMissing(h))return;const u=!h&&1===a.a&&1===o&&t.opaquePassEnabledForLayer()?"opaque":"translucent";if(t.renderPass!==u)return;const d=zi.disabled,_=t.depthModeForSublayer(0,"opaque"===u?Di.ReadWrite:Di.ReadOnly),m=t.colorModeForRenderPass(),p=t.useProgram(h?"backgroundPattern":"background"),f=s||l.coveringTiles({tileSize:c,terrain:t.style.map.terrain});h&&(r.activeTexture.set(n.TEXTURE0),t.imageManager.bind(t.context));const g=i.getCrossfadeParameters();for(const e of f){const l=s?e.posMatrix:t.transform.calculatePosMatrix(e.toUnwrapped()),u=h?Be(l,o,t,h,{tileID:e,tileSize:c},g):Fe(l,o,a),f=t.style.map.terrain&&t.style.map.terrain.getTerrainData(e);p.draw(r,n.TRIANGLES,_,d,m,Ai.disabled,u,f,i.id,t.tileExtentBuffer,t.quadTriangleIndexBuffer,t.tileExtentSegments);}}(e,0,s,a);break;case"custom":!function(t,e,i){const s=t.context,a=i.implementation;if("offscreen"===t.renderPass){const e=a.prerender;e&&(t.setCustomLayerDefaults(),s.setColorMode(t.colorModeForRenderPass()),e.call(a,s.gl,t.transform.customLayerMatrix()),s.setDirty(),t.setBaseState());}else if("translucent"===t.renderPass){t.setCustomLayerDefaults(),s.setColorMode(t.colorModeForRenderPass()),s.setStencilMode(zi.disabled);const e="3d"===a.renderingMode?new Di(t.context.gl.LEQUAL,Di.ReadWrite,t.depthRangeFor3D):t.depthModeForSublayer(0,Di.ReadOnly);s.setDepthMode(e),a.render(s.gl,t.transform.customLayerMatrix()),s.setDirty(),t.setBaseState(),s.bindFramebuffer.set(null);}}(e,0,s);}}translatePosMatrix(e,i,s,a,o){if(!s[0]&&!s[1])return e;const r=o?"map"===a?this.transform.angle:0:"viewport"===a?-this.transform.angle:0;if(r){const t=Math.sin(r),e=Math.cos(r);s=[s[0]*e-s[1]*t,s[0]*t+s[1]*e];}const n=[o?s[0]:Ct(i,s[0],this.transform.zoom),o?s[1]:Ct(i,s[1],this.transform.zoom),0],l=new Float32Array(16);return t.translate(l,e,n),l}saveTileTexture(t){const e=this._tileTextures[t.size[0]];e?e.push(t):this._tileTextures[t.size[0]]=[t];}getTileTexture(t){const e=this._tileTextures[t];return e&&e.length>0?e.pop():null}isPatternMissing(t){if(!t)return !1;if(!t.from||!t.to)return !0;const e=this.imageManager.getPattern(t.from.toString()),i=this.imageManager.getPattern(t.to.toString());return !e||!i}useProgram(t,e){this.cache=this.cache||{};const i=t+(e?e.cacheKey:"")+(this._showOverdrawInspector?"/overdraw":"")+(this.style.map.terrain?"/terrain":"");return this.cache[i]||(this.cache[i]=new ue(this.context,ne[t],e,Ue[t],this._showOverdrawInspector,this.style.map.terrain)),this.cache[i]}setCustomLayerDefaults(){this.context.unbindVAO(),this.context.cullFace.setDefault(),this.context.activeTexture.setDefault(),this.context.pixelStoreUnpack.setDefault(),this.context.pixelStoreUnpackPremultiplyAlpha.setDefault(),this.context.pixelStoreUnpackFlipY.setDefault();}setBaseState(){const t=this.context.gl;this.context.cullFace.set(!1),this.context.viewport.set([0,0,this.width,this.height]),this.context.blendEquation.set(t.FUNC_ADD);}initDebugOverlayCanvas(){null==this.debugOverlayCanvas&&(this.debugOverlayCanvas=document.createElement("canvas"),this.debugOverlayCanvas.width=512,this.debugOverlayCanvas.height=512,this.debugOverlayTexture=new x(this.context,this.debugOverlayCanvas,this.context.gl.RGBA));}destroy(){this.debugOverlayTexture&&this.debugOverlayTexture.destroy();}overLimit(){const{drawingBufferWidth:t,drawingBufferHeight:e}=this.context.gl;return this.width!==t||this.height!==e}}class as{constructor(t,e){this.points=t,this.planes=e;}static fromInvProjectionMatrix(e,i,s){const a=Math.pow(2,s),o=[[-1,1,-1,1],[1,1,-1,1],[1,-1,-1,1],[-1,-1,-1,1],[-1,1,1,1],[1,1,1,1],[1,-1,1,1],[-1,-1,1,1]].map((s=>{const o=1/(s=t.transformMat4([],s,e))[3]/i*a;return t.mul$1(s,s,[o,o,1/s[3],o])})),r=[[0,1,2],[6,5,4],[0,3,7],[2,1,5],[3,2,6],[0,4,5]].map((t=>{const e=function(t,e){var i=e[0],s=e[1],a=e[2],o=i*i+s*s+a*a;return o>0&&(o=1/Math.sqrt(o)),t[0]=e[0]*o,t[1]=e[1]*o,t[2]=e[2]*o,t}([],function(t,e,i){var s=e[0],a=e[1],o=e[2],r=i[0],n=i[1],l=i[2];return t[0]=a*l-o*n,t[1]=o*r-s*l,t[2]=s*n-a*r,t}([],p([],o[t[0]],o[t[1]]),p([],o[t[2]],o[t[1]]))),i=-((s=e)[0]*(a=o[t[1]])[0]+s[1]*a[1]+s[2]*a[2]);var s,a;return e.concat(i)}));return new as(o,r)}}class os{constructor(t,e){this.min=t,this.max=e,this.center=function(t,e,i){return t[0]=.5*e[0],t[1]=.5*e[1],t[2]=.5*e[2],t}([],function(t,e,i){return t[0]=e[0]+i[0],t[1]=e[1]+i[1],t[2]=e[2]+i[2],t}([],this.min,this.max));}quadrant(t){const e=[t%2==0,t<2],i=_(this.min),s=_(this.max);for(let t=0;t<e.length;t++)i[t]=e[t]?this.min[t]:this.center[t],s[t]=e[t]?this.center[t]:this.max[t];return s[2]=this.max[2],new os(i,s)}distanceX(t){return Math.max(Math.min(this.max[0],t[0]),this.min[0])-t[0]}distanceY(t){return Math.max(Math.min(this.max[1],t[1]),this.min[1])-t[1]}intersects(e){const i=[[this.min[0],this.min[1],this.min[2],1],[this.max[0],this.min[1],this.min[2],1],[this.max[0],this.max[1],this.min[2],1],[this.min[0],this.max[1],this.min[2],1],[this.min[0],this.min[1],this.max[2],1],[this.max[0],this.min[1],this.max[2],1],[this.max[0],this.max[1],this.max[2],1],[this.min[0],this.max[1],this.max[2],1]];let s=!0;for(let a=0;a<e.planes.length;a++){const o=e.planes[a];let r=0;for(let e=0;e<i.length;e++)t.dot(o,i[e])>=0&&r++;if(0===r)return 0;r!==i.length&&(s=!1);}if(s)return 2;for(let t=0;t<3;t++){let i=Number.MAX_VALUE,s=-Number.MAX_VALUE;for(let a=0;a<e.points.length;a++){const o=e.points[a][t]-this.min[t];i=Math.min(i,o),s=Math.max(s,o);}if(s<0||i>this.max[t]-this.min[t])return 0}return 1}}class rs{constructor(t=0,e=0,i=0,s=0){if(isNaN(t)||t<0||isNaN(e)||e<0||isNaN(i)||i<0||isNaN(s)||s<0)throw new Error("Invalid value for edge-insets, top, bottom, left and right must all be numbers");this.top=t,this.bottom=e,this.left=i,this.right=s;}interpolate(e,i,s){return null!=i.top&&null!=e.top&&(this.top=t.interpolate.number(e.top,i.top,s)),null!=i.bottom&&null!=e.bottom&&(this.bottom=t.interpolate.number(e.bottom,i.bottom,s)),null!=i.left&&null!=e.left&&(this.left=t.interpolate.number(e.left,i.left,s)),null!=i.right&&null!=e.right&&(this.right=t.interpolate.number(e.right,i.right,s)),this}getCenter(e,i){const s=t.clamp((this.left+e-this.right)/2,0,e),a=t.clamp((this.top+i-this.bottom)/2,0,i);return new t.Point(s,a)}equals(t){return this.top===t.top&&this.bottom===t.bottom&&this.left===t.left&&this.right===t.right}clone(){return new rs(this.top,this.bottom,this.left,this.right)}toJSON(){return {top:this.top,bottom:this.bottom,left:this.left,right:this.right}}}class ns{constructor(e,i,s,a,o){this.tileSize=512,this.maxValidLatitude=85.051129,this._renderWorldCopies=void 0===o||!!o,this._minZoom=e||0,this._maxZoom=i||22,this._minPitch=null==s?0:s,this._maxPitch=null==a?60:a,this.setMaxBounds(),this.width=0,this.height=0,this._center=new t.LngLat(0,0),this._elevation=0,this.zoom=0,this.angle=0,this._fov=.6435011087932844,this._pitch=0,this._unmodified=!0,this._edgeInsets=new rs,this._posMatrixCache={},this._alignedPosMatrixCache={},this._minEleveationForCurrentTile=0;}clone(){const t=new ns(this._minZoom,this._maxZoom,this._minPitch,this.maxPitch,this._renderWorldCopies);return t.apply(this),t}apply(t){this.tileSize=t.tileSize,this.latRange=t.latRange,this.width=t.width,this.height=t.height,this._center=t._center,this._elevation=t._elevation,this._minEleveationForCurrentTile=t._minEleveationForCurrentTile,this.zoom=t.zoom,this.angle=t.angle,this._fov=t._fov,this._pitch=t._pitch,this._unmodified=t._unmodified,this._edgeInsets=t._edgeInsets.clone(),this._calcMatrices();}get minZoom(){return this._minZoom}set minZoom(t){this._minZoom!==t&&(this._minZoom=t,this.zoom=Math.max(this.zoom,t));}get maxZoom(){return this._maxZoom}set maxZoom(t){this._maxZoom!==t&&(this._maxZoom=t,this.zoom=Math.min(this.zoom,t));}get minPitch(){return this._minPitch}set minPitch(t){this._minPitch!==t&&(this._minPitch=t,this.pitch=Math.max(this.pitch,t));}get maxPitch(){return this._maxPitch}set maxPitch(t){this._maxPitch!==t&&(this._maxPitch=t,this.pitch=Math.min(this.pitch,t));}get renderWorldCopies(){return this._renderWorldCopies}set renderWorldCopies(t){void 0===t?t=!0:null===t&&(t=!1),this._renderWorldCopies=t;}get worldSize(){return this.tileSize*this.scale}get centerOffset(){return this.centerPoint._sub(this.size._div(2))}get size(){return new t.Point(this.width,this.height)}get bearing(){return -this.angle/Math.PI*180}set bearing(e){const i=-t.wrap(e,-180,180)*Math.PI/180;this.angle!==i&&(this._unmodified=!1,this.angle=i,this._calcMatrices(),this.rotationMatrix=function(){var e=new t.ARRAY_TYPE(4);return t.ARRAY_TYPE!=Float32Array&&(e[1]=0,e[2]=0),e[0]=1,e[3]=1,e}(),function(t,e,i){var s=e[0],a=e[1],o=e[2],r=e[3],n=Math.sin(i),l=Math.cos(i);t[0]=s*l+o*n,t[1]=a*l+r*n,t[2]=s*-n+o*l,t[3]=a*-n+r*l;}(this.rotationMatrix,this.rotationMatrix,this.angle));}get pitch(){return this._pitch/Math.PI*180}set pitch(e){const i=t.clamp(e,this.minPitch,this.maxPitch)/180*Math.PI;this._pitch!==i&&(this._unmodified=!1,this._pitch=i,this._calcMatrices());}get fov(){return this._fov/Math.PI*180}set fov(t){t=Math.max(.01,Math.min(60,t)),this._fov!==t&&(this._unmodified=!1,this._fov=t/180*Math.PI,this._calcMatrices());}get zoom(){return this._zoom}set zoom(t){const e=Math.min(Math.max(t,this.minZoom),this.maxZoom);this._zoom!==e&&(this._unmodified=!1,this._zoom=e,this.tileZoom=Math.max(0,Math.floor(e)),this.scale=this.zoomScale(e),this._constrain(),this._calcMatrices());}get center(){return this._center}set center(t){t.lat===this._center.lat&&t.lng===this._center.lng||(this._unmodified=!1,this._center=t,this._constrain(),this._calcMatrices());}get elevation(){return this._elevation}set elevation(t){t!==this._elevation&&(this._elevation=t,this._constrain(),this._calcMatrices());}get padding(){return this._edgeInsets.toJSON()}set padding(t){this._edgeInsets.equals(t)||(this._unmodified=!1,this._edgeInsets.interpolate(this._edgeInsets,t,1),this._calcMatrices());}get centerPoint(){return this._edgeInsets.getCenter(this.width,this.height)}isPaddingEqual(t){return this._edgeInsets.equals(t)}interpolatePadding(t,e,i){this._unmodified=!1,this._edgeInsets.interpolate(t,e,i),this._constrain(),this._calcMatrices();}coveringZoomLevel(t){const e=(t.roundZoom?Math.round:Math.floor)(this.zoom+this.scaleZoom(this.tileSize/t.tileSize));return Math.max(0,e)}getVisibleUnwrappedCoordinates(e){const i=[new t.UnwrappedTileID(0,e)];if(this._renderWorldCopies){const s=this.pointCoordinate(new t.Point(0,0)),a=this.pointCoordinate(new t.Point(this.width,0)),o=this.pointCoordinate(new t.Point(this.width,this.height)),r=this.pointCoordinate(new t.Point(0,this.height)),n=Math.floor(Math.min(s.x,a.x,o.x,r.x)),l=Math.floor(Math.max(s.x,a.x,o.x,r.x)),c=1;for(let s=n-c;s<=l+c;s++)0!==s&&i.push(new t.UnwrappedTileID(s,e));}return i}coveringTiles(e){var i,s;let a=this.coveringZoomLevel(e);const o=a;if(void 0!==e.minzoom&&a<e.minzoom)return [];void 0!==e.maxzoom&&a>e.maxzoom&&(a=e.maxzoom);const r=this.pointCoordinate(this.getCameraPoint()),n=t.MercatorCoordinate.fromLngLat(this.center),l=Math.pow(2,a),c=[l*r.x,l*r.y,0],h=[l*n.x,l*n.y,0],u=as.fromInvProjectionMatrix(this.invProjMatrix,this.worldSize,a);let d=e.minzoom||0;!e.terrain&&this.pitch<=60&&this._edgeInsets.top<.1&&(d=a);const _=e.terrain?2/Math.min(this.tileSize,e.tileSize)*this.tileSize:3,m=t=>({aabb:new os([t*l,0,0],[(t+1)*l,l,0]),zoom:0,x:0,y:0,wrap:t,fullyVisible:!1}),p=[],g=[],v=a,x=e.reparseOverscaled?o:a;if(this._renderWorldCopies)for(let t=1;t<=3;t++)p.push(m(-t)),p.push(m(t));for(p.push(m(0));p.length>0;){const a=p.pop(),o=a.x,r=a.y;let n=a.fullyVisible;if(!n){const t=a.aabb.intersects(u);if(0===t)continue;n=2===t;}const l=e.terrain?c:h,m=a.aabb.distanceX(l),y=a.aabb.distanceY(l),b=Math.max(Math.abs(m),Math.abs(y));if(a.zoom===v||b>_+(1<<v-a.zoom)-2&&a.zoom>=d){const e=v-a.zoom,i=c[0]-.5-(o<<e),s=c[1]-.5-(r<<e);g.push({tileID:new t.OverscaledTileID(a.zoom===v?x:a.zoom,a.wrap,a.zoom,o,r),distanceSq:f([h[0]-.5-o,h[1]-.5-r]),tileDistanceToCamera:Math.sqrt(i*i+s*s)});}else for(let l=0;l<4;l++){const c=(o<<1)+l%2,h=(r<<1)+(l>>1),u=a.zoom+1;let d=a.aabb.quadrant(l);if(e.terrain){const o=new t.OverscaledTileID(u,a.wrap,u,c,h),r=e.terrain.getMinMaxElevation(o),n=null!==(i=r.minElevation)&&void 0!==i?i:this.elevation,l=null!==(s=r.maxElevation)&&void 0!==s?s:this.elevation;d=new os([d.min[0],d.min[1],n],[d.max[0],d.max[1],l]);}p.push({aabb:d,zoom:u,x:c,y:h,wrap:a.wrap,fullyVisible:n});}}return g.sort(((t,e)=>t.distanceSq-e.distanceSq)).map((t=>t.tileID))}resize(t,e){this.width=t,this.height=e,this.pixelsToGLUnits=[2/t,-2/e],this._constrain(),this._calcMatrices();}get unmodified(){return this._unmodified}zoomScale(t){return Math.pow(2,t)}scaleZoom(t){return Math.log(t)/Math.LN2}project(e){const i=t.clamp(e.lat,-this.maxValidLatitude,this.maxValidLatitude);return new t.Point(t.mercatorXfromLng(e.lng)*this.worldSize,t.mercatorYfromLat(i)*this.worldSize)}unproject(e){return new t.MercatorCoordinate(e.x/this.worldSize,e.y/this.worldSize).toLngLat()}get point(){return this.project(this.center)}getCameraPosition(){return {lngLat:this.pointLocation(this.getCameraPoint()),altitude:Math.cos(this._pitch)*this.cameraToCenterDistance/this._pixelPerMeter+this.elevation}}recalculateZoom(e){const i=this.pointLocation(this.centerPoint,e),s=e.getElevationForLngLatZoom(i,this.tileZoom);if(!(this.elevation-s))return;const a=this.getCameraPosition(),o=t.MercatorCoordinate.fromLngLat(a.lngLat,a.altitude),r=t.MercatorCoordinate.fromLngLat(i,s),n=o.x-r.x,l=o.y-r.y,c=o.z-r.z,h=Math.sqrt(n*n+l*l+c*c),u=this.scaleZoom(this.cameraToCenterDistance/h/this.tileSize);this._elevation=s,this._center=i,this.zoom=u;}setLocationAtPoint(e,i){const s=this.pointCoordinate(i),a=this.pointCoordinate(this.centerPoint),o=this.locationCoordinate(e),r=new t.MercatorCoordinate(o.x-(s.x-a.x),o.y-(s.y-a.y));this.center=this.coordinateLocation(r),this._renderWorldCopies&&(this.center=this.center.wrap());}locationPoint(t,e){return e?this.coordinatePoint(this.locationCoordinate(t),e.getElevationForLngLatZoom(t,this.tileZoom),this.pixelMatrix3D):this.coordinatePoint(this.locationCoordinate(t))}pointLocation(t,e){return this.coordinateLocation(this.pointCoordinate(t,e))}locationCoordinate(e){return t.MercatorCoordinate.fromLngLat(e)}coordinateLocation(t){return t&&t.toLngLat()}pointCoordinate(e,i){if(i){const t=i.pointCoordinate(e);if(null!=t)return t}const s=[e.x,e.y,0,1],a=[e.x,e.y,1,1];t.transformMat4(s,s,this.pixelMatrixInverse),t.transformMat4(a,a,this.pixelMatrixInverse);const o=s[3],r=a[3],n=s[1]/o,l=a[1]/r,c=s[2]/o,h=a[2]/r,u=c===h?0:(0-c)/(h-c);return new t.MercatorCoordinate(t.interpolate.number(s[0]/o,a[0]/r,u)/this.worldSize,t.interpolate.number(n,l,u)/this.worldSize)}coordinatePoint(e,i=0,s=this.pixelMatrix){const a=[e.x*this.worldSize,e.y*this.worldSize,i,1];return t.transformMat4(a,a,s),new t.Point(a[0]/a[3],a[1]/a[3])}getBounds(){const e=Math.max(0,this.height/2-this.getHorizon());return (new L).extend(this.pointLocation(new t.Point(0,e))).extend(this.pointLocation(new t.Point(this.width,e))).extend(this.pointLocation(new t.Point(this.width,this.height))).extend(this.pointLocation(new t.Point(0,this.height)))}getMaxBounds(){return this.latRange&&2===this.latRange.length&&this.lngRange&&2===this.lngRange.length?new L([this.lngRange[0],this.latRange[0]],[this.lngRange[1],this.latRange[1]]):null}getHorizon(){return Math.tan(Math.PI/2-this._pitch)*this.cameraToCenterDistance*.85}setMaxBounds(t){t?(this.lngRange=[t.getWest(),t.getEast()],this.latRange=[t.getSouth(),t.getNorth()],this._constrain()):(this.lngRange=null,this.latRange=[-this.maxValidLatitude,this.maxValidLatitude]);}calculatePosMatrix(e,i=!1){const s=e.key,a=i?this._alignedPosMatrixCache:this._posMatrixCache;if(a[s])return a[s];const o=e.canonical,r=this.worldSize/this.zoomScale(o.z),n=o.x+Math.pow(2,o.z)*e.wrap,l=t.identity(new Float64Array(16));return t.translate(l,l,[n*r,o.y*r,0]),t.scale(l,l,[r/t.EXTENT,r/t.EXTENT,1]),t.multiply(l,i?this.alignedProjMatrix:this.projMatrix,l),a[s]=new Float32Array(l),a[s]}customLayerMatrix(){return this.mercatorMatrix.slice()}_constrain(){if(!this.center||!this.width||!this.height||this._constraining)return;this._constraining=!0;let e,i,s,a,o=-90,r=90,n=-180,l=180;const c=this.size,h=this._unmodified;if(this.latRange){const i=this.latRange;o=t.mercatorYfromLat(i[1])*this.worldSize,r=t.mercatorYfromLat(i[0])*this.worldSize,e=r-o<c.y?c.y/(r-o):0;}if(this.lngRange){const e=this.lngRange;n=t.wrap(t.mercatorXfromLng(e[0])*this.worldSize,0,this.worldSize),l=t.wrap(t.mercatorXfromLng(e[1])*this.worldSize,0,this.worldSize),l<n&&(l+=this.worldSize),i=l-n<c.x?c.x/(l-n):0;}const u=this.point,d=Math.max(i||0,e||0);if(d)return this.center=this.unproject(new t.Point(i?(l+n)/2:u.x,e?(r+o)/2:u.y)),this.zoom+=this.scaleZoom(d),this._unmodified=h,void(this._constraining=!1);if(this.latRange){const t=u.y,e=c.y/2;t-e<o&&(a=o+e),t+e>r&&(a=r-e);}if(this.lngRange){const e=(n+l)/2,i=t.wrap(u.x,e-this.worldSize/2,e+this.worldSize/2),a=c.x/2;i-a<n&&(s=n+a),i+a>l&&(s=l-a);}void 0===s&&void 0===a||(this.center=this.unproject(new t.Point(void 0!==s?s:u.x,void 0!==a?a:u.y)).wrap()),this._unmodified=h,this._constraining=!1;}_calcMatrices(){if(!this.height)return;const e=this.centerOffset,i=this.point.x,s=this.point.y;this.cameraToCenterDistance=.5/Math.tan(this._fov/2)*this.height,this._pixelPerMeter=t.mercatorZfromAltitude(1,this.center.lat)*this.worldSize;let a=t.identity(new Float64Array(16));t.scale(a,a,[this.width/2,-this.height/2,1]),t.translate(a,a,[1,-1,0]),this.labelPlaneMatrix=a,a=t.identity(new Float64Array(16)),t.scale(a,a,[1,-1,1]),t.translate(a,a,[-1,-1,0]),t.scale(a,a,[2/this.width,2/this.height,1]),this.glCoordMatrix=a;const o=this.cameraToCenterDistance+this._elevation*this._pixelPerMeter/Math.cos(this._pitch),r=Math.min(this.elevation,this._minEleveationForCurrentTile),n=o-r*this._pixelPerMeter/Math.cos(this._pitch),l=r<0?n:o,c=Math.PI/2+this._pitch,h=this._fov*(.5+e.y/this.height),u=Math.sin(h)*l/Math.sin(t.clamp(Math.PI-c-h,.01,Math.PI-.01)),d=this.getHorizon(),_=2*Math.atan(d/this.cameraToCenterDistance)*(.5+e.y/(2*d)),m=Math.sin(_)*l/Math.sin(t.clamp(Math.PI-c-_,.01,Math.PI-.01)),p=Math.min(u,m),f=1.01*(Math.cos(Math.PI/2-this._pitch)*p+l),g=this.height/50;a=new Float64Array(16),t.perspective(a,this._fov,this.width/this.height,g,f),a[8]=2*-e.x/this.width,a[9]=2*e.y/this.height,t.scale(a,a,[1,-1,1]),t.translate(a,a,[0,0,-this.cameraToCenterDistance]),t.rotateX(a,a,this._pitch),t.rotateZ(a,a,this.angle),t.translate(a,a,[-i,-s,0]),this.mercatorMatrix=t.scale([],a,[this.worldSize,this.worldSize,this.worldSize]),t.scale(a,a,[1,1,this._pixelPerMeter]),this.pixelMatrix=t.multiply(new Float64Array(16),this.labelPlaneMatrix,a),t.translate(a,a,[0,0,-this.elevation]),this.projMatrix=a,this.invProjMatrix=t.invert([],a),this.pixelMatrix3D=t.multiply(new Float64Array(16),this.labelPlaneMatrix,a);const v=this.width%2/2,x=this.height%2/2,y=Math.cos(this.angle),b=Math.sin(this.angle),w=i-Math.round(i)+y*v+b*x,T=s-Math.round(s)+y*x+b*v,E=new Float64Array(a);if(t.translate(E,E,[w>.5?w-1:w,T>.5?T-1:T,0]),this.alignedProjMatrix=E,a=t.invert(new Float64Array(16),this.pixelMatrix),!a)throw new Error("failed to invert matrix");this.pixelMatrixInverse=a,this._posMatrixCache={},this._alignedPosMatrixCache={};}maxPitchScaleFactor(){if(!this.pixelMatrixInverse)return 1;const e=this.pointCoordinate(new t.Point(0,0)),i=[e.x*this.worldSize,e.y*this.worldSize,0,1];return t.transformMat4(i,i,this.pixelMatrix)[3]/this.cameraToCenterDistance}getCameraPoint(){const e=Math.tan(this._pitch)*(this.cameraToCenterDistance||1);return this.centerPoint.add(new t.Point(0,e))}getCameraQueryGeometry(e){const i=this.getCameraPoint();if(1===e.length)return [e[0],i];{let s=i.x,a=i.y,o=i.x,r=i.y;for(const t of e)s=Math.min(s,t.x),a=Math.min(a,t.y),o=Math.max(o,t.x),r=Math.max(r,t.y);return [new t.Point(s,a),new t.Point(o,a),new t.Point(o,r),new t.Point(s,r),new t.Point(s,a)]}}}function ls(t,e){let i,s=!1,a=null,o=null;const r=()=>{a=null,s&&(t.apply(o,i),a=setTimeout(r,e),s=!1);};return (...t)=>(s=!0,o=this,i=t,a||r(),a)}class cs{constructor(t){this._getCurrentHash=()=>{const t=window.location.hash.replace("#","");if(this._hashName){let e;return t.split("&").map((t=>t.split("="))).forEach((t=>{t[0]===this._hashName&&(e=t);})),(e&&e[1]||"").split("/")}return t.split("/")},this._onHashChange=()=>{const t=this._getCurrentHash();if(t.length>=3&&!t.some((t=>isNaN(t)))){const e=this._map.dragRotate.isEnabled()&&this._map.touchZoomRotate.isEnabled()?+(t[3]||0):this._map.getBearing();return this._map.jumpTo({center:[+t[2],+t[1]],zoom:+t[0],bearing:e,pitch:+(t[4]||0)}),!0}return !1},this._updateHashUnthrottled=()=>{const t=window.location.href.replace(/(#.+)?$/,this.getHashString());try{window.history.replaceState(window.history.state,null,t);}catch(t){}},this._updateHash=ls(this._updateHashUnthrottled,300),this._hashName=t&&encodeURIComponent(t);}addTo(t){return this._map=t,addEventListener("hashchange",this._onHashChange,!1),this._map.on("moveend",this._updateHash),this}remove(){return removeEventListener("hashchange",this._onHashChange,!1),this._map.off("moveend",this._updateHash),clearTimeout(this._updateHash()),delete this._map,this}getHashString(t){const e=this._map.getCenter(),i=Math.round(100*this._map.getZoom())/100,s=Math.ceil((i*Math.LN2+Math.log(512/360/.5))/Math.LN10),a=Math.pow(10,s),o=Math.round(e.lng*a)/a,r=Math.round(e.lat*a)/a,n=this._map.getBearing(),l=this._map.getPitch();let c="";if(c+=t?`/${o}/${r}/${i}`:`${i}/${r}/${o}`,(n||l)&&(c+="/"+Math.round(10*n)/10),l&&(c+=`/${Math.round(l)}`),this._hashName){const t=this._hashName;let e=!1;const i=window.location.hash.slice(1).split("&").map((i=>{const s=i.split("=")[0];return s===t?(e=!0,`${s}=${c}`):i})).filter((t=>t));return e||i.push(`${t}=${c}`),`#${i.join("&")}`}return `#${c}`}}const hs={linearity:.3,easing:t.bezier(0,0,.3,1)},us=t.extend({deceleration:2500,maxSpeed:1400},hs),ds=t.extend({deceleration:20,maxSpeed:1400},hs),_s=t.extend({deceleration:1e3,maxSpeed:360},hs),ms=t.extend({deceleration:1e3,maxSpeed:90},hs);class ps{constructor(t){this._map=t,this.clear();}clear(){this._inertiaBuffer=[];}record(e){this._drainInertiaBuffer(),this._inertiaBuffer.push({time:t.browser.now(),settings:e});}_drainInertiaBuffer(){const e=this._inertiaBuffer,i=t.browser.now();for(;e.length>0&&i-e[0].time>160;)e.shift();}_onMoveEnd(e){if(this._drainInertiaBuffer(),this._inertiaBuffer.length<2)return;const i={zoom:0,bearing:0,pitch:0,pan:new t.Point(0,0),pinchAround:void 0,around:void 0};for(const{settings:t}of this._inertiaBuffer)i.zoom+=t.zoomDelta||0,i.bearing+=t.bearingDelta||0,i.pitch+=t.pitchDelta||0,t.panDelta&&i.pan._add(t.panDelta),t.around&&(i.around=t.around),t.pinchAround&&(i.pinchAround=t.pinchAround);const s=this._inertiaBuffer[this._inertiaBuffer.length-1].time-this._inertiaBuffer[0].time,a={};if(i.pan.mag()){const o=gs(i.pan.mag(),s,t.extend({},us,e||{}));a.offset=i.pan.mult(o.amount/i.pan.mag()),a.center=this._map.transform.center,fs(a,o);}if(i.zoom){const t=gs(i.zoom,s,ds);a.zoom=this._map.transform.zoom+t.amount,fs(a,t);}if(i.bearing){const e=gs(i.bearing,s,_s);a.bearing=this._map.transform.bearing+t.clamp(e.amount,-179,179),fs(a,e);}if(i.pitch){const t=gs(i.pitch,s,ms);a.pitch=this._map.transform.pitch+t.amount,fs(a,t);}if(a.zoom||a.bearing){const t=void 0===i.pinchAround?i.around:i.pinchAround;a.around=t?this._map.unproject(t):this._map.getCenter();}return this.clear(),t.extend(a,{noMoveStart:!0})}}function fs(t,e){(!t.duration||t.duration<e.duration)&&(t.duration=e.duration,t.easing=e.easing);}function gs(e,i,s){const{maxSpeed:a,linearity:o,deceleration:r}=s,n=t.clamp(e*o/(i/1e3),-a,a),l=Math.abs(n)/(r*o);return {easing:s.easing,duration:1e3*l,amount:n*(l/2)}}class vs extends t.Event{preventDefault(){this._defaultPrevented=!0;}get defaultPrevented(){return this._defaultPrevented}constructor(e,s,a,o={}){const r=i.mousePos(s.getCanvasContainer(),a),n=s.unproject(r);super(e,t.extend({point:r,lngLat:n,originalEvent:a},o)),this._defaultPrevented=!1,this.target=s;}}class xs extends t.Event{preventDefault(){this._defaultPrevented=!0;}get defaultPrevented(){return this._defaultPrevented}constructor(e,s,a){const o="touchend"===e?a.changedTouches:a.touches,r=i.touchPos(s.getCanvasContainer(),o),n=r.map((t=>s.unproject(t))),l=r.reduce(((t,e,i,s)=>t.add(e.div(s.length))),new t.Point(0,0));super(e,{points:r,point:l,lngLats:n,lngLat:s.unproject(l),originalEvent:a}),this._defaultPrevented=!1;}}class ys extends t.Event{preventDefault(){this._defaultPrevented=!0;}get defaultPrevented(){return this._defaultPrevented}constructor(t,e,i){super(t,{originalEvent:i}),this._defaultPrevented=!1;}}class bs{constructor(t,e){this._map=t,this._clickTolerance=e.clickTolerance;}reset(){delete this._mousedownPos;}wheel(t){return this._firePreventable(new ys(t.type,this._map,t))}mousedown(t,e){return this._mousedownPos=e,this._firePreventable(new vs(t.type,this._map,t))}mouseup(t){this._map.fire(new vs(t.type,this._map,t));}click(t,e){this._mousedownPos&&this._mousedownPos.dist(e)>=this._clickTolerance||this._map.fire(new vs(t.type,this._map,t));}dblclick(t){return this._firePreventable(new vs(t.type,this._map,t))}mouseover(t){this._map.fire(new vs(t.type,this._map,t));}mouseout(t){this._map.fire(new vs(t.type,this._map,t));}touchstart(t){return this._firePreventable(new xs(t.type,this._map,t))}touchmove(t){this._map.fire(new xs(t.type,this._map,t));}touchend(t){this._map.fire(new xs(t.type,this._map,t));}touchcancel(t){this._map.fire(new xs(t.type,this._map,t));}_firePreventable(t){if(this._map.fire(t),t.defaultPrevented)return {}}isEnabled(){return !0}isActive(){return !1}enable(){}disable(){}}class ws{constructor(t){this._map=t;}reset(){this._delayContextMenu=!1,this._ignoreContextMenu=!0,delete this._contextMenuEvent;}mousemove(t){this._map.fire(new vs(t.type,this._map,t));}mousedown(){this._delayContextMenu=!0,this._ignoreContextMenu=!1;}mouseup(){this._delayContextMenu=!1,this._contextMenuEvent&&(this._map.fire(new vs("contextmenu",this._map,this._contextMenuEvent)),delete this._contextMenuEvent);}contextmenu(t){this._delayContextMenu?this._contextMenuEvent=t:this._ignoreContextMenu||this._map.fire(new vs(t.type,this._map,t)),this._map.listens("contextmenu")&&t.preventDefault();}isEnabled(){return !0}isActive(){return !1}enable(){}disable(){}}class Ts{constructor(t){this._map=t;}get transform(){return this._map._requestedCameraState||this._map.transform}get center(){return {lng:this.transform.center.lng,lat:this.transform.center.lat}}get zoom(){return this.transform.zoom}get pitch(){return this.transform.pitch}get bearing(){return this.transform.bearing}unproject(e){return this.transform.pointLocation(t.Point.convert(e),this._map.terrain)}}class Es{constructor(t,e){this._map=t,this._tr=new Ts(t),this._el=t.getCanvasContainer(),this._container=t.getContainer(),this._clickTolerance=e.clickTolerance||1;}isEnabled(){return !!this._enabled}isActive(){return !!this._active}enable(){this.isEnabled()||(this._enabled=!0);}disable(){this.isEnabled()&&(this._enabled=!1);}mousedown(t,e){this.isEnabled()&&t.shiftKey&&0===t.button&&(i.disableDrag(),this._startPos=this._lastPos=e,this._active=!0);}mousemoveWindow(t,e){if(!this._active)return;const s=e;if(this._lastPos.equals(s)||!this._box&&s.dist(this._startPos)<this._clickTolerance)return;const a=this._startPos;this._lastPos=s,this._box||(this._box=i.create("div","maplibregl-boxzoom",this._container),this._container.classList.add("maplibregl-crosshair"),this._fireEvent("boxzoomstart",t));const o=Math.min(a.x,s.x),r=Math.max(a.x,s.x),n=Math.min(a.y,s.y),l=Math.max(a.y,s.y);i.setTransform(this._box,`translate(${o}px,${n}px)`),this._box.style.width=r-o+"px",this._box.style.height=l-n+"px";}mouseupWindow(e,s){if(!this._active)return;if(0!==e.button)return;const a=this._startPos,o=s;if(this.reset(),i.suppressClick(),a.x!==o.x||a.y!==o.y)return this._map.fire(new t.Event("boxzoomend",{originalEvent:e})),{cameraAnimation:t=>t.fitScreenCoordinates(a,o,this._tr.bearing,{linear:!0})};this._fireEvent("boxzoomcancel",e);}keydown(t){this._active&&27===t.keyCode&&(this.reset(),this._fireEvent("boxzoomcancel",t));}reset(){this._active=!1,this._container.classList.remove("maplibregl-crosshair"),this._box&&(i.remove(this._box),this._box=null),i.enableDrag(),delete this._startPos,delete this._lastPos;}_fireEvent(e,i){return this._map.fire(new t.Event(e,{originalEvent:i}))}}function Is(t,e){if(t.length!==e.length)throw new Error(`The number of touches and points are not equal - touches ${t.length}, points ${e.length}`);const i={};for(let s=0;s<t.length;s++)i[t[s].identifier]=e[s];return i}class Ss{constructor(t){this.reset(),this.numTouches=t.numTouches;}reset(){delete this.centroid,delete this.startTime,delete this.touches,this.aborted=!1;}touchstart(e,i,s){(this.centroid||s.length>this.numTouches)&&(this.aborted=!0),this.aborted||(void 0===this.startTime&&(this.startTime=e.timeStamp),s.length===this.numTouches&&(this.centroid=function(e){const i=new t.Point(0,0);for(const t of e)i._add(t);return i.div(e.length)}(i),this.touches=Is(s,i)));}touchmove(t,e,i){if(this.aborted||!this.centroid)return;const s=Is(i,e);for(const t in this.touches){const e=s[t];(!e||e.dist(this.touches[t])>30)&&(this.aborted=!0);}}touchend(t,e,i){if((!this.centroid||t.timeStamp-this.startTime>500)&&(this.aborted=!0),0===i.length){const t=!this.aborted&&this.centroid;if(this.reset(),t)return t}}}class Cs{constructor(t){this.singleTap=new Ss(t),this.numTaps=t.numTaps,this.reset();}reset(){this.lastTime=1/0,delete this.lastTap,this.count=0,this.singleTap.reset();}touchstart(t,e,i){this.singleTap.touchstart(t,e,i);}touchmove(t,e,i){this.singleTap.touchmove(t,e,i);}touchend(t,e,i){const s=this.singleTap.touchend(t,e,i);if(s){const e=t.timeStamp-this.lastTime<500,i=!this.lastTap||this.lastTap.dist(s)<30;if(e&&i||this.reset(),this.count++,this.lastTime=t.timeStamp,this.lastTap=s,this.count===this.numTaps)return this.reset(),s}}}class Ps{constructor(t){this._tr=new Ts(t),this._zoomIn=new Cs({numTouches:1,numTaps:2}),this._zoomOut=new Cs({numTouches:2,numTaps:1}),this.reset();}reset(){this._active=!1,this._zoomIn.reset(),this._zoomOut.reset();}touchstart(t,e,i){this._zoomIn.touchstart(t,e,i),this._zoomOut.touchstart(t,e,i);}touchmove(t,e,i){this._zoomIn.touchmove(t,e,i),this._zoomOut.touchmove(t,e,i);}touchend(t,e,i){const s=this._zoomIn.touchend(t,e,i),a=this._zoomOut.touchend(t,e,i),o=this._tr;return s?(this._active=!0,t.preventDefault(),setTimeout((()=>this.reset()),0),{cameraAnimation:e=>e.easeTo({duration:300,zoom:o.zoom+1,around:o.unproject(s)},{originalEvent:t})}):a?(this._active=!0,t.preventDefault(),setTimeout((()=>this.reset()),0),{cameraAnimation:e=>e.easeTo({duration:300,zoom:o.zoom-1,around:o.unproject(a)},{originalEvent:t})}):void 0}touchcancel(){this.reset();}enable(){this._enabled=!0;}disable(){this._enabled=!1,this.reset();}isEnabled(){return this._enabled}isActive(){return this._active}}class Ds{constructor(t){this._enabled=!!t.enable,this._moveStateManager=t.moveStateManager,this._clickTolerance=t.clickTolerance||1,this._moveFunction=t.move,this._activateOnStart=!!t.activateOnStart,t.assignEvents(this),this.reset();}reset(t){this._active=!1,this._moved=!1,delete this._lastPoint,this._moveStateManager.endMove(t);}_move(...t){const e=this._moveFunction(...t);if(e.bearingDelta||e.pitchDelta||e.around||e.panDelta)return this._active=!0,e}dragStart(t,e){this.isEnabled()&&!this._lastPoint&&this._moveStateManager.isValidStartEvent(t)&&(this._moveStateManager.startMove(t),this._lastPoint=e.length?e[0]:e,this._activateOnStart&&this._lastPoint&&(this._active=!0));}dragMove(t,e){if(!this.isEnabled())return;const i=this._lastPoint;if(!i)return;if(t.preventDefault(),!this._moveStateManager.isValidMoveEvent(t))return void this.reset(t);const s=e.length?e[0]:e;return !this._moved&&s.dist(i)<this._clickTolerance?void 0:(this._moved=!0,this._lastPoint=s,this._move(i,s))}dragEnd(t){this.isEnabled()&&this._lastPoint&&this._moveStateManager.isValidEndEvent(t)&&(this._moved&&i.suppressClick(),this.reset(t));}enable(){this._enabled=!0;}disable(){this._enabled=!1,this.reset();}isEnabled(){return this._enabled}isActive(){return this._active}getClickTolerance(){return this._clickTolerance}}const Ms={0:1,2:2};class zs{constructor(t){this._correctEvent=t.checkCorrectEvent;}startMove(t){const e=i.mouseButton(t);this._eventButton=e;}endMove(t){delete this._eventButton;}isValidStartEvent(t){return this._correctEvent(t)}isValidMoveEvent(t){return !function(t,e){const i=Ms[e];return void 0===t.buttons||(t.buttons&i)!==i}(t,this._eventButton)}isValidEndEvent(t){return i.mouseButton(t)===this._eventButton}}class As{constructor(){this._firstTouch=void 0;}_isOneFingerTouch(t){return 1===t.targetTouches.length}_isSameTouchEvent(t){return t.targetTouches[0].identifier===this._firstTouch}startMove(t){this._firstTouch=t.targetTouches[0].identifier;}endMove(t){delete this._firstTouch;}isValidStartEvent(t){return this._isOneFingerTouch(t)}isValidMoveEvent(t){return this._isOneFingerTouch(t)&&this._isSameTouchEvent(t)}isValidEndEvent(t){return this._isOneFingerTouch(t)&&this._isSameTouchEvent(t)}}const Ls=t=>{t.mousedown=t.dragStart,t.mousemoveWindow=t.dragMove,t.mouseup=t.dragEnd,t.contextmenu=function(t){t.preventDefault();};},Rs=({enable:t,clickTolerance:e,bearingDegreesPerPixelMoved:s=.8})=>{const a=new zs({checkCorrectEvent:t=>0===i.mouseButton(t)&&t.ctrlKey||2===i.mouseButton(t)});return new Ds({clickTolerance:e,move:(t,e)=>({bearingDelta:(e.x-t.x)*s}),moveStateManager:a,enable:t,assignEvents:Ls})},ks=({enable:t,clickTolerance:e,pitchDegreesPerPixelMoved:s=-.5})=>{const a=new zs({checkCorrectEvent:t=>0===i.mouseButton(t)&&t.ctrlKey||2===i.mouseButton(t)});return new Ds({clickTolerance:e,move:(t,e)=>({pitchDelta:(e.y-t.y)*s}),moveStateManager:a,enable:t,assignEvents:Ls})};class Fs{constructor(t,e){this._minTouches=t.cooperativeGestures?2:1,this._clickTolerance=t.clickTolerance||1,this._map=e,this.reset();}reset(){this._active=!1,this._touches={},this._sum=new t.Point(0,0),setTimeout((()=>{this._cancelCooperativeMessage=!1;}),200);}touchstart(t,e,i){return this._calculateTransform(t,e,i)}touchmove(t,e,i){if(this._map._cooperativeGestures&&(2===this._minTouches&&i.length<2&&!this._cancelCooperativeMessage?this._map._onCooperativeGesture(t,!1,i.length):this._cancelCooperativeMessage||(this._cancelCooperativeMessage=!0)),this._active&&!(i.length<this._minTouches))return t.preventDefault(),this._calculateTransform(t,e,i)}touchend(t,e,i){this._calculateTransform(t,e,i),this._active&&i.length<this._minTouches&&this.reset();}touchcancel(){this.reset();}_calculateTransform(e,i,s){s.length>0&&(this._active=!0);const a=Is(s,i),o=new t.Point(0,0),r=new t.Point(0,0);let n=0;for(const t in a){const e=a[t],i=this._touches[t];i&&(o._add(e),r._add(e.sub(i)),n++,a[t]=e);}if(this._touches=a,n<this._minTouches||!r.mag())return;const l=r.div(n);return this._sum._add(l),this._sum.mag()<this._clickTolerance?void 0:{around:o.div(n),panDelta:l}}enable(){this._enabled=!0;}disable(){this._enabled=!1,this.reset();}isEnabled(){return this._enabled}isActive(){return this._active}}class Bs{constructor(){this.reset();}reset(){this._active=!1,delete this._firstTwoTouches;}touchstart(t,e,i){this._firstTwoTouches||i.length<2||(this._firstTwoTouches=[i[0].identifier,i[1].identifier],this._start([e[0],e[1]]));}touchmove(t,e,i){if(!this._firstTwoTouches)return;t.preventDefault();const[s,a]=this._firstTwoTouches,o=Us(i,e,s),r=Us(i,e,a);if(!o||!r)return;const n=this._aroundCenter?null:o.add(r).div(2);return this._move([o,r],n,t)}touchend(t,e,s){if(!this._firstTwoTouches)return;const[a,o]=this._firstTwoTouches,r=Us(s,e,a),n=Us(s,e,o);r&&n||(this._active&&i.suppressClick(),this.reset());}touchcancel(){this.reset();}enable(t){this._enabled=!0,this._aroundCenter=!!t&&"center"===t.around;}disable(){this._enabled=!1,this.reset();}isEnabled(){return this._enabled}isActive(){return this._active}}function Us(t,e,i){for(let s=0;s<t.length;s++)if(t[s].identifier===i)return e[s]}function Os(t,e){return Math.log(t/e)/Math.LN2}class Ns extends Bs{reset(){super.reset(),delete this._distance,delete this._startDistance;}_start(t){this._startDistance=this._distance=t[0].dist(t[1]);}_move(t,e){const i=this._distance;if(this._distance=t[0].dist(t[1]),this._active||!(Math.abs(Os(this._distance,this._startDistance))<.1))return this._active=!0,{zoomDelta:Os(this._distance,i),pinchAround:e}}}function Zs(t,e){return 180*t.angleWith(e)/Math.PI}class Gs extends Bs{reset(){super.reset(),delete this._minDiameter,delete this._startVector,delete this._vector;}_start(t){this._startVector=this._vector=t[0].sub(t[1]),this._minDiameter=t[0].dist(t[1]);}_move(t,e){const i=this._vector;if(this._vector=t[0].sub(t[1]),this._active||!this._isBelowThreshold(this._vector))return this._active=!0,{bearingDelta:Zs(this._vector,i),pinchAround:e}}_isBelowThreshold(t){this._minDiameter=Math.min(this._minDiameter,t.mag());const e=25/(Math.PI*this._minDiameter)*360,i=Zs(t,this._startVector);return Math.abs(i)<e}}function Vs(t){return Math.abs(t.y)>Math.abs(t.x)}class qs extends Bs{constructor(t){super(),this._map=t;}reset(){super.reset(),this._valid=void 0,delete this._firstMove,delete this._lastPoints;}touchstart(t,e,i){super.touchstart(t,e,i),this._currentTouchCount=i.length;}_start(t){this._lastPoints=t,Vs(t[0].sub(t[1]))&&(this._valid=!1);}_move(t,e,i){if(this._map._cooperativeGestures&&this._currentTouchCount<3)return;const s=t[0].sub(this._lastPoints[0]),a=t[1].sub(this._lastPoints[1]);return this._valid=this.gestureBeginsVertically(s,a,i.timeStamp),this._valid?(this._lastPoints=t,this._active=!0,{pitchDelta:(s.y+a.y)/2*-.5}):void 0}gestureBeginsVertically(t,e,i){if(void 0!==this._valid)return this._valid;const s=t.mag()>=2,a=e.mag()>=2;if(!s&&!a)return;if(!s||!a)return void 0===this._firstMove&&(this._firstMove=i),i-this._firstMove<100&&void 0;const o=t.y>0==e.y>0;return Vs(t)&&Vs(e)&&o}}const js={panStep:100,bearingStep:15,pitchStep:10};class $s{constructor(t){this._tr=new Ts(t);const e=js;this._panStep=e.panStep,this._bearingStep=e.bearingStep,this._pitchStep=e.pitchStep,this._rotationDisabled=!1;}reset(){this._active=!1;}keydown(t){if(t.altKey||t.ctrlKey||t.metaKey)return;let e=0,i=0,s=0,a=0,o=0;switch(t.keyCode){case 61:case 107:case 171:case 187:e=1;break;case 189:case 109:case 173:e=-1;break;case 37:t.shiftKey?i=-1:(t.preventDefault(),a=-1);break;case 39:t.shiftKey?i=1:(t.preventDefault(),a=1);break;case 38:t.shiftKey?s=1:(t.preventDefault(),o=-1);break;case 40:t.shiftKey?s=-1:(t.preventDefault(),o=1);break;default:return}return this._rotationDisabled&&(i=0,s=0),{cameraAnimation:r=>{const n=this._tr;r.easeTo({duration:300,easeId:"keyboardHandler",easing:Xs,zoom:e?Math.round(n.zoom)+e*(t.shiftKey?2:1):n.zoom,bearing:n.bearing+i*this._bearingStep,pitch:n.pitch+s*this._pitchStep,offset:[-a*this._panStep,-o*this._panStep],center:n.center},{originalEvent:t});}}}enable(){this._enabled=!0;}disable(){this._enabled=!1,this.reset();}isEnabled(){return this._enabled}isActive(){return this._active}disableRotation(){this._rotationDisabled=!0;}enableRotation(){this._rotationDisabled=!1;}}function Xs(t){return t*(2-t)}const Ws=4.000244140625;class Hs{constructor(t,e){this._onTimeout=t=>{this._type="wheel",this._delta-=this._lastValue,this._active||this._start(t);},this._map=t,this._tr=new Ts(t),this._el=t.getCanvasContainer(),this._triggerRenderFrame=e,this._delta=0,this._defaultZoomRate=.01,this._wheelZoomRate=.0022222222222222222;}setZoomRate(t){this._defaultZoomRate=t;}setWheelZoomRate(t){this._wheelZoomRate=t;}isEnabled(){return !!this._enabled}isActive(){return !!this._active||void 0!==this._finishTimeout}isZooming(){return !!this._zooming}enable(t){this.isEnabled()||(this._enabled=!0,this._aroundCenter=!!t&&"center"===t.around);}disable(){this.isEnabled()&&(this._enabled=!1);}wheel(e){if(!this.isEnabled())return;if(this._map._cooperativeGestures){if(!e[this._map._metaKey])return;e.preventDefault();}let i=e.deltaMode===WheelEvent.DOM_DELTA_LINE?40*e.deltaY:e.deltaY;const s=t.browser.now(),a=s-(this._lastWheelEventTime||0);this._lastWheelEventTime=s,0!==i&&i%Ws==0?this._type="wheel":0!==i&&Math.abs(i)<4?this._type="trackpad":a>400?(this._type=null,this._lastValue=i,this._timeout=setTimeout(this._onTimeout,40,e)):this._type||(this._type=Math.abs(a*i)<200?"trackpad":"wheel",this._timeout&&(clearTimeout(this._timeout),this._timeout=null,i+=this._lastValue)),e.shiftKey&&i&&(i/=4),this._type&&(this._lastWheelEvent=e,this._delta-=i,this._active||this._start(e)),e.preventDefault();}_start(e){if(!this._delta)return;this._frameId&&(this._frameId=null),this._active=!0,this.isZooming()||(this._zooming=!0),this._finishTimeout&&(clearTimeout(this._finishTimeout),delete this._finishTimeout);const s=i.mousePos(this._el,e),a=this._tr;this._around=t.LngLat.convert(this._aroundCenter?a.center:a.unproject(s)),this._aroundPoint=a.transform.locationPoint(this._around),this._frameId||(this._frameId=!0,this._triggerRenderFrame());}renderFrame(){if(!this._frameId)return;if(this._frameId=null,!this.isActive())return;const e=this._tr.transform;if(0!==this._delta){const t="wheel"===this._type&&Math.abs(this._delta)>Ws?this._wheelZoomRate:this._defaultZoomRate;let i=2/(1+Math.exp(-Math.abs(this._delta*t)));this._delta<0&&0!==i&&(i=1/i);const s="number"==typeof this._targetZoom?e.zoomScale(this._targetZoom):e.scale;this._targetZoom=Math.min(e.maxZoom,Math.max(e.minZoom,e.scaleZoom(s*i))),"wheel"===this._type&&(this._startZoom=e.zoom,this._easing=this._smoothOutEasing(200)),this._delta=0;}const i="number"==typeof this._targetZoom?this._targetZoom:e.zoom,s=this._startZoom,a=this._easing;let o,r=!1;if("wheel"===this._type&&s&&a){const e=Math.min((t.browser.now()-this._lastWheelEventTime)/200,1),n=a(e);o=t.interpolate.number(s,i,n),e<1?this._frameId||(this._frameId=!0):r=!0;}else o=i,r=!0;return this._active=!0,r&&(this._active=!1,this._finishTimeout=setTimeout((()=>{this._zooming=!1,this._triggerRenderFrame(),delete this._targetZoom,delete this._finishTimeout;}),200)),{noInertia:!0,needsRenderFrame:!r,zoomDelta:o-e.zoom,around:this._aroundPoint,originalEvent:this._lastWheelEvent}}_smoothOutEasing(e){let i=t.defaultEasing;if(this._prevEase){const e=this._prevEase,s=(t.browser.now()-e.start)/e.duration,a=e.easing(s+.01)-e.easing(s),o=.27/Math.sqrt(a*a+1e-4)*.01,r=Math.sqrt(.0729-o*o);i=t.bezier(o,r,.25,1);}return this._prevEase={start:t.browser.now(),duration:e,easing:i},i}reset(){this._active=!1;}}class Ks{constructor(t,e){this._clickZoom=t,this._tapZoom=e;}enable(){this._clickZoom.enable(),this._tapZoom.enable();}disable(){this._clickZoom.disable(),this._tapZoom.disable();}isEnabled(){return this._clickZoom.isEnabled()&&this._tapZoom.isEnabled()}isActive(){return this._clickZoom.isActive()||this._tapZoom.isActive()}}class Ys{constructor(t){this._tr=new Ts(t),this.reset();}reset(){this._active=!1;}dblclick(t,e){return t.preventDefault(),{cameraAnimation:i=>{i.easeTo({duration:300,zoom:this._tr.zoom+(t.shiftKey?-1:1),around:this._tr.unproject(e)},{originalEvent:t});}}}enable(){this._enabled=!0;}disable(){this._enabled=!1,this.reset();}isEnabled(){return this._enabled}isActive(){return this._active}}class Js{constructor(){this._tap=new Cs({numTouches:1,numTaps:1}),this.reset();}reset(){this._active=!1,delete this._swipePoint,delete this._swipeTouch,delete this._tapTime,delete this._tapPoint,this._tap.reset();}touchstart(t,e,i){if(!this._swipePoint)if(this._tapTime){const s=e[0],a=t.timeStamp-this._tapTime<500,o=this._tapPoint.dist(s)<30;a&&o?i.length>0&&(this._swipePoint=s,this._swipeTouch=i[0].identifier):this.reset();}else this._tap.touchstart(t,e,i);}touchmove(t,e,i){if(this._tapTime){if(this._swipePoint){if(i[0].identifier!==this._swipeTouch)return;const s=e[0],a=s.y-this._swipePoint.y;return this._swipePoint=s,t.preventDefault(),this._active=!0,{zoomDelta:a/128}}}else this._tap.touchmove(t,e,i);}touchend(t,e,i){if(this._tapTime)this._swipePoint&&0===i.length&&this.reset();else {const s=this._tap.touchend(t,e,i);s&&(this._tapTime=t.timeStamp,this._tapPoint=s);}}touchcancel(){this.reset();}enable(){this._enabled=!0;}disable(){this._enabled=!1,this.reset();}isEnabled(){return this._enabled}isActive(){return this._active}}class Qs{constructor(t,e,i){this._el=t,this._mousePan=e,this._touchPan=i;}enable(t){this._inertiaOptions=t||{},this._mousePan.enable(),this._touchPan.enable(),this._el.classList.add("maplibregl-touch-drag-pan");}disable(){this._mousePan.disable(),this._touchPan.disable(),this._el.classList.remove("maplibregl-touch-drag-pan");}isEnabled(){return this._mousePan.isEnabled()&&this._touchPan.isEnabled()}isActive(){return this._mousePan.isActive()||this._touchPan.isActive()}}class ta{constructor(t,e,i){this._pitchWithRotate=t.pitchWithRotate,this._mouseRotate=e,this._mousePitch=i;}enable(){this._mouseRotate.enable(),this._pitchWithRotate&&this._mousePitch.enable();}disable(){this._mouseRotate.disable(),this._mousePitch.disable();}isEnabled(){return this._mouseRotate.isEnabled()&&(!this._pitchWithRotate||this._mousePitch.isEnabled())}isActive(){return this._mouseRotate.isActive()||this._mousePitch.isActive()}}class ea{constructor(t,e,i,s){this._el=t,this._touchZoom=e,this._touchRotate=i,this._tapDragZoom=s,this._rotationDisabled=!1,this._enabled=!0;}enable(t){this._touchZoom.enable(t),this._rotationDisabled||this._touchRotate.enable(t),this._tapDragZoom.enable(),this._el.classList.add("maplibregl-touch-zoom-rotate");}disable(){this._touchZoom.disable(),this._touchRotate.disable(),this._tapDragZoom.disable(),this._el.classList.remove("maplibregl-touch-zoom-rotate");}isEnabled(){return this._touchZoom.isEnabled()&&(this._rotationDisabled||this._touchRotate.isEnabled())&&this._tapDragZoom.isEnabled()}isActive(){return this._touchZoom.isActive()||this._touchRotate.isActive()||this._tapDragZoom.isActive()}disableRotation(){this._rotationDisabled=!0,this._touchRotate.disable();}enableRotation(){this._rotationDisabled=!1,this._touchZoom.isEnabled()&&this._touchRotate.enable();}}const ia=t=>t.zoom||t.drag||t.pitch||t.rotate;class sa extends t.Event{}function aa(t){return t.panDelta&&t.panDelta.mag()||t.zoomDelta||t.bearingDelta||t.pitchDelta}class oa{constructor(t,e){this.handleWindowEvent=t=>{this.handleEvent(t,`${t.type}Window`);},this.handleEvent=(t,e)=>{if("blur"===t.type)return void this.stop(!0);this._updatingCamera=!0;const s="renderFrame"===t.type?void 0:t,a={needsRenderFrame:!1},o={},r={},n=t.touches,l=n?this._getMapTouches(n):void 0,c=l?i.touchPos(this._el,l):i.mousePos(this._el,t);for(const{handlerName:i,handler:n,allowed:h}of this._handlers){if(!n.isEnabled())continue;let u;this._blockedByActive(r,h,i)?n.reset():n[e||t.type]&&(u=n[e||t.type](t,c,l),this.mergeHandlerResult(a,o,u,i,s),u&&u.needsRenderFrame&&this._triggerRenderFrame()),(u||n.isActive())&&(r[i]=n);}const h={};for(const t in this._previousActiveHandlers)r[t]||(h[t]=s);this._previousActiveHandlers=r,(Object.keys(h).length||aa(a))&&(this._changes.push([a,o,h]),this._triggerRenderFrame()),(Object.keys(r).length||aa(a))&&this._map._stop(!0),this._updatingCamera=!1;const{cameraAnimation:u}=a;u&&(this._inertia.clear(),this._fireEvents({},{},!0),this._changes=[],u(this._map));},this._map=t,this._el=this._map.getCanvasContainer(),this._handlers=[],this._handlersById={},this._changes=[],this._inertia=new ps(t),this._bearingSnap=e.bearingSnap,this._previousActiveHandlers={},this._eventsInProgress={},this._addDefaultHandlers(e);const s=this._el;this._listeners=[[s,"touchstart",{passive:!0}],[s,"touchmove",{passive:!1}],[s,"touchend",void 0],[s,"touchcancel",void 0],[s,"mousedown",void 0],[s,"mousemove",void 0],[s,"mouseup",void 0],[document,"mousemove",{capture:!0}],[document,"mouseup",void 0],[s,"mouseover",void 0],[s,"mouseout",void 0],[s,"dblclick",void 0],[s,"click",void 0],[s,"keydown",{capture:!1}],[s,"keyup",void 0],[s,"wheel",{passive:!1}],[s,"contextmenu",void 0],[window,"blur",void 0]];for(const[t,e,s]of this._listeners)i.addEventListener(t,e,t===document?this.handleWindowEvent:this.handleEvent,s);}destroy(){for(const[t,e,s]of this._listeners)i.removeEventListener(t,e,t===document?this.handleWindowEvent:this.handleEvent,s);}_addDefaultHandlers(t){const e=this._map,s=e.getCanvasContainer();this._add("mapEvent",new bs(e,t));const a=e.boxZoom=new Es(e,t);this._add("boxZoom",a),t.interactive&&t.boxZoom&&a.enable();const o=new Ps(e),r=new Ys(e);e.doubleClickZoom=new Ks(r,o),this._add("tapZoom",o),this._add("clickZoom",r),t.interactive&&t.doubleClickZoom&&e.doubleClickZoom.enable();const n=new Js;this._add("tapDragZoom",n);const l=e.touchPitch=new qs(e);this._add("touchPitch",l),t.interactive&&t.touchPitch&&e.touchPitch.enable(t.touchPitch);const c=Rs(t),h=ks(t);e.dragRotate=new ta(t,c,h),this._add("mouseRotate",c,["mousePitch"]),this._add("mousePitch",h,["mouseRotate"]),t.interactive&&t.dragRotate&&e.dragRotate.enable();const u=(({enable:t,clickTolerance:e})=>{const s=new zs({checkCorrectEvent:t=>0===i.mouseButton(t)&&!t.ctrlKey});return new Ds({clickTolerance:e,move:(t,e)=>({around:e,panDelta:e.sub(t)}),activateOnStart:!0,moveStateManager:s,enable:t,assignEvents:Ls})})(t),d=new Fs(t,e);e.dragPan=new Qs(s,u,d),this._add("mousePan",u),this._add("touchPan",d,["touchZoom","touchRotate"]),t.interactive&&t.dragPan&&e.dragPan.enable(t.dragPan);const _=new Gs,m=new Ns;e.touchZoomRotate=new ea(s,m,_,n),this._add("touchRotate",_,["touchPan","touchZoom"]),this._add("touchZoom",m,["touchPan","touchRotate"]),t.interactive&&t.touchZoomRotate&&e.touchZoomRotate.enable(t.touchZoomRotate);const p=e.scrollZoom=new Hs(e,(()=>this._triggerRenderFrame()));this._add("scrollZoom",p,["mousePan"]),t.interactive&&t.scrollZoom&&e.scrollZoom.enable(t.scrollZoom);const f=e.keyboard=new $s(e);this._add("keyboard",f),t.interactive&&t.keyboard&&e.keyboard.enable(),this._add("blockableMapEvent",new ws(e));}_add(t,e,i){this._handlers.push({handlerName:t,handler:e,allowed:i}),this._handlersById[t]=e;}stop(t){if(!this._updatingCamera){for(const{handler:t}of this._handlers)t.reset();this._inertia.clear(),this._fireEvents({},{},t),this._changes=[];}}isActive(){for(const{handler:t}of this._handlers)if(t.isActive())return !0;return !1}isZooming(){return !!this._eventsInProgress.zoom||this._map.scrollZoom.isZooming()}isRotating(){return !!this._eventsInProgress.rotate}isMoving(){return Boolean(ia(this._eventsInProgress))||this.isZooming()}_blockedByActive(t,e,i){for(const s in t)if(s!==i&&(!e||e.indexOf(s)<0))return !0;return !1}_getMapTouches(t){const e=[];for(const i of t)this._el.contains(i.target)&&e.push(i);return e}mergeHandlerResult(e,i,s,a,o){if(!s)return;t.extend(e,s);const r={handlerName:a,originalEvent:s.originalEvent||o};void 0!==s.zoomDelta&&(i.zoom=r),void 0!==s.panDelta&&(i.drag=r),void 0!==s.pitchDelta&&(i.pitch=r),void 0!==s.bearingDelta&&(i.rotate=r);}_applyChanges(){const e={},i={},s={};for(const[a,o,r]of this._changes)a.panDelta&&(e.panDelta=(e.panDelta||new t.Point(0,0))._add(a.panDelta)),a.zoomDelta&&(e.zoomDelta=(e.zoomDelta||0)+a.zoomDelta),a.bearingDelta&&(e.bearingDelta=(e.bearingDelta||0)+a.bearingDelta),a.pitchDelta&&(e.pitchDelta=(e.pitchDelta||0)+a.pitchDelta),void 0!==a.around&&(e.around=a.around),void 0!==a.pinchAround&&(e.pinchAround=a.pinchAround),a.noInertia&&(e.noInertia=a.noInertia),t.extend(i,o),t.extend(s,r);this._updateMapTransform(e,i,s),this._changes=[];}_updateMapTransform(t,e,i){const s=this._map,a=s._getTransformForUpdate(),o=s.terrain;if(!(aa(t)||o&&this._terrainMovement))return this._fireEvents(e,i,!0);let{panDelta:r,zoomDelta:n,bearingDelta:l,pitchDelta:c,around:h,pinchAround:u}=t;void 0!==u&&(h=u),s._stop(!0),h=h||s.transform.centerPoint;const d=a.pointLocation(r?h.sub(r):h);l&&(a.bearing+=l),c&&(a.pitch+=c),n&&(a.zoom+=n),o?this._terrainMovement||!e.drag&&!e.zoom?e.drag&&this._terrainMovement?a.center=a.pointLocation(a.centerPoint.sub(r)):a.setLocationAtPoint(d,h):(this._terrainMovement=!0,this._map._elevationFreeze=!0,a.setLocationAtPoint(d,h),this._map.once("moveend",(()=>{this._map._elevationFreeze=!1,this._terrainMovement=!1,a.recalculateZoom(s.terrain);}))):a.setLocationAtPoint(d,h),s._applyUpdatedTransform(a),this._map._update(),t.noInertia||this._inertia.record(t),this._fireEvents(e,i,!0);}_fireEvents(e,i,s){const a=ia(this._eventsInProgress),o=ia(e),r={};for(const t in e){const{originalEvent:i}=e[t];this._eventsInProgress[t]||(r[`${t}start`]=i),this._eventsInProgress[t]=e[t];}!a&&o&&this._fireEvent("movestart",o.originalEvent);for(const t in r)this._fireEvent(t,r[t]);o&&this._fireEvent("move",o.originalEvent);for(const t in e){const{originalEvent:i}=e[t];this._fireEvent(t,i);}const n={};let l;for(const t in this._eventsInProgress){const{handlerName:e,originalEvent:s}=this._eventsInProgress[t];this._handlersById[e].isActive()||(delete this._eventsInProgress[t],l=i[e]||s,n[`${t}end`]=l);}for(const t in n)this._fireEvent(t,n[t]);const c=ia(this._eventsInProgress);if(s&&(a||o)&&!c){this._updatingCamera=!0;const e=this._inertia._onMoveEnd(this._map.dragPan._inertiaOptions),i=t=>0!==t&&-this._bearingSnap<t&&t<this._bearingSnap;e?(i(e.bearing||this._map.getBearing())&&(e.bearing=0),e.freezeElevation=!0,this._map.easeTo(e,{originalEvent:l})):(this._map.fire(new t.Event("moveend",{originalEvent:l})),i(this._map.getBearing())&&this._map.resetNorth()),this._updatingCamera=!1;}}_fireEvent(e,i){this._map.fire(new t.Event(e,i?{originalEvent:i}:{}));}_requestFrame(){return this._map.triggerRepaint(),this._map._renderTaskQueue.add((t=>{delete this._frameId,this.handleEvent(new sa("renderFrame",{timeStamp:t})),this._applyChanges();}))}_triggerRenderFrame(){void 0===this._frameId&&(this._frameId=this._requestFrame());}}class ra extends t.Evented{constructor(e,i){super(),this._renderFrameCallback=()=>{const e=Math.min((t.browser.now()-this._easeStart)/this._easeOptions.duration,1);this._onEaseFrame(this._easeOptions.easing(e)),e<1?this._easeFrameId=this._requestRenderFrame(this._renderFrameCallback):this.stop();},this._moving=!1,this._zooming=!1,this.transform=e,this._bearingSnap=i.bearingSnap,this.on("moveend",(()=>{delete this._requestedCameraState;}));}getCenter(){return new t.LngLat(this.transform.center.lng,this.transform.center.lat)}setCenter(t,e){return this.jumpTo({center:t},e)}panBy(e,i,s){return e=t.Point.convert(e).mult(-1),this.panTo(this.transform.center,t.extend({offset:e},i),s)}panTo(e,i,s){return this.easeTo(t.extend({center:e},i),s)}getZoom(){return this.transform.zoom}setZoom(t,e){return this.jumpTo({zoom:t},e),this}zoomTo(e,i,s){return this.easeTo(t.extend({zoom:e},i),s)}zoomIn(t,e){return this.zoomTo(this.getZoom()+1,t,e),this}zoomOut(t,e){return this.zoomTo(this.getZoom()-1,t,e),this}getBearing(){return this.transform.bearing}setBearing(t,e){return this.jumpTo({bearing:t},e),this}getPadding(){return this.transform.padding}setPadding(t,e){return this.jumpTo({padding:t},e),this}rotateTo(e,i,s){return this.easeTo(t.extend({bearing:e},i),s)}resetNorth(e,i){return this.rotateTo(0,t.extend({duration:1e3},e),i),this}resetNorthPitch(e,i){return this.easeTo(t.extend({bearing:0,pitch:0,duration:1e3},e),i),this}snapToNorth(t,e){return Math.abs(this.getBearing())<this._bearingSnap?this.resetNorth(t,e):this}getPitch(){return this.transform.pitch}setPitch(t,e){return this.jumpTo({pitch:t},e),this}cameraForBounds(t,e){t=L.convert(t);const i=e&&e.bearing||0;return this._cameraForBoxAndBearing(t.getNorthWest(),t.getSouthEast(),i,e)}_cameraForBoxAndBearing(e,i,s,a){const o={top:0,bottom:0,right:0,left:0};if("number"==typeof(a=t.extend({padding:o,offset:[0,0],maxZoom:this.transform.maxZoom},a)).padding){const t=a.padding;a.padding={top:t,bottom:t,right:t,left:t};}a.padding=t.extend(o,a.padding);const r=this.transform,n=r.padding,l=r.project(t.LngLat.convert(e)),c=r.project(t.LngLat.convert(i)),h=l.rotate(-s*Math.PI/180),u=c.rotate(-s*Math.PI/180),d=new t.Point(Math.max(h.x,u.x),Math.max(h.y,u.y)),_=new t.Point(Math.min(h.x,u.x),Math.min(h.y,u.y)),m=d.sub(_),p=(r.width-(n.left+n.right+a.padding.left+a.padding.right))/m.x,f=(r.height-(n.top+n.bottom+a.padding.top+a.padding.bottom))/m.y;if(f<0||p<0)return void t.warnOnce("Map cannot fit within canvas with the given bounds, padding, and/or offset.");const g=Math.min(r.scaleZoom(r.scale*Math.min(p,f)),a.maxZoom),v=t.Point.convert(a.offset),x=new t.Point((a.padding.left-a.padding.right)/2,(a.padding.top-a.padding.bottom)/2).rotate(s*Math.PI/180),y=v.add(x).mult(r.scale/r.zoomScale(g));return {center:r.unproject(l.add(c).div(2).sub(y)),zoom:g,bearing:s}}fitBounds(t,e,i){return this._fitInternal(this.cameraForBounds(t,e),e,i)}fitScreenCoordinates(e,i,s,a,o){return this._fitInternal(this._cameraForBoxAndBearing(this.transform.pointLocation(t.Point.convert(e)),this.transform.pointLocation(t.Point.convert(i)),s,a),a,o)}_fitInternal(e,i,s){return e?(delete(i=t.extend(e,i)).padding,i.linear?this.easeTo(i,s):this.flyTo(i,s)):this}jumpTo(e,i){this.stop();const s=this._getTransformForUpdate();let a=!1,o=!1,r=!1;return "zoom"in e&&s.zoom!==+e.zoom&&(a=!0,s.zoom=+e.zoom),void 0!==e.center&&(s.center=t.LngLat.convert(e.center)),"bearing"in e&&s.bearing!==+e.bearing&&(o=!0,s.bearing=+e.bearing),"pitch"in e&&s.pitch!==+e.pitch&&(r=!0,s.pitch=+e.pitch),null==e.padding||s.isPaddingEqual(e.padding)||(s.padding=e.padding),this._applyUpdatedTransform(s),this.fire(new t.Event("movestart",i)).fire(new t.Event("move",i)),a&&this.fire(new t.Event("zoomstart",i)).fire(new t.Event("zoom",i)).fire(new t.Event("zoomend",i)),o&&this.fire(new t.Event("rotatestart",i)).fire(new t.Event("rotate",i)).fire(new t.Event("rotateend",i)),r&&this.fire(new t.Event("pitchstart",i)).fire(new t.Event("pitch",i)).fire(new t.Event("pitchend",i)),this.fire(new t.Event("moveend",i))}calculateCameraOptionsFromTo(e,i,s,a=0){const o=t.MercatorCoordinate.fromLngLat(e,i),r=t.MercatorCoordinate.fromLngLat(s,a),n=r.x-o.x,l=r.y-o.y,c=r.z-o.z,h=Math.hypot(n,l,c);if(0===h)throw new Error("Can't calculate camera options with same From and To");const u=Math.hypot(n,l),d=this.transform.scaleZoom(this.transform.cameraToCenterDistance/h/this.transform.tileSize),_=180*Math.atan2(n,-l)/Math.PI;let m=180*Math.acos(u/h)/Math.PI;return m=c<0?90-m:90+m,{center:r.toLngLat(),zoom:d,pitch:m,bearing:_}}easeTo(e,i){this._stop(!1,e.easeId),(!1===(e=t.extend({offset:[0,0],duration:500,easing:t.defaultEasing},e)).animate||!e.essential&&t.browser.prefersReducedMotion)&&(e.duration=0);const s=this._getTransformForUpdate(),a=this.getZoom(),o=this.getBearing(),r=this.getPitch(),n=this.getPadding(),l="zoom"in e?+e.zoom:a,c="bearing"in e?this._normalizeBearing(e.bearing,o):o,h="pitch"in e?+e.pitch:r,u="padding"in e?e.padding:s.padding,d=t.Point.convert(e.offset);let _=s.centerPoint.add(d);const m=s.pointLocation(_),p=t.LngLat.convert(e.center||m);this._normalizeCenter(p);const f=s.project(m),g=s.project(p).sub(f),v=s.zoomScale(l-a);let x,y;e.around&&(x=t.LngLat.convert(e.around),y=s.locationPoint(x));const b={moving:this._moving,zooming:this._zooming,rotating:this._rotating,pitching:this._pitching};return this._zooming=this._zooming||l!==a,this._rotating=this._rotating||o!==c,this._pitching=this._pitching||h!==r,this._padding=!s.isPaddingEqual(u),this._easeId=e.easeId,this._prepareEase(i,e.noMoveStart,b),this.terrain&&this._prepareElevation(p),this._ease((m=>{if(this._zooming&&(s.zoom=t.interpolate.number(a,l,m)),this._rotating&&(s.bearing=t.interpolate.number(o,c,m)),this._pitching&&(s.pitch=t.interpolate.number(r,h,m)),this._padding&&(s.interpolatePadding(n,u,m),_=s.centerPoint.add(d)),this.terrain&&!e.freezeElevation&&this._updateElevation(m),x)s.setLocationAtPoint(x,y);else {const t=s.zoomScale(s.zoom-a),e=l>a?Math.min(2,v):Math.max(.5,v),i=Math.pow(e,1-m),o=s.unproject(f.add(g.mult(m*i)).mult(t));s.setLocationAtPoint(s.renderWorldCopies?o.wrap():o,_);}this._applyUpdatedTransform(s),this._fireMoveEvents(i);}),(t=>{this.terrain&&this._finalizeElevation(),this._afterEase(i,t);}),e),this}_prepareEase(e,i,s={}){this._moving=!0,i||s.moving||this.fire(new t.Event("movestart",e)),this._zooming&&!s.zooming&&this.fire(new t.Event("zoomstart",e)),this._rotating&&!s.rotating&&this.fire(new t.Event("rotatestart",e)),this._pitching&&!s.pitching&&this.fire(new t.Event("pitchstart",e));}_prepareElevation(t){this._elevationCenter=t,this._elevationStart=this.transform.elevation,this._elevationTarget=this.terrain.getElevationForLngLatZoom(t,this.transform.tileZoom),this._elevationFreeze=!0;}_updateElevation(e){this.transform._minEleveationForCurrentTile=this.terrain.getMinTileElevationForLngLatZoom(this._elevationCenter,this.transform.tileZoom);const i=this.terrain.getElevationForLngLatZoom(this._elevationCenter,this.transform.tileZoom);if(e<1&&i!==this._elevationTarget){const t=this._elevationTarget-this._elevationStart;this._elevationStart+=e*(t-(i-(t*e+this._elevationStart))/(1-e)),this._elevationTarget=i;}this.transform.elevation=t.interpolate.number(this._elevationStart,this._elevationTarget,e);}_finalizeElevation(){this._elevationFreeze=!1,this.transform.recalculateZoom(this.terrain);}_getTransformForUpdate(){return this.transformCameraUpdate?(this._requestedCameraState||(this._requestedCameraState=this.transform.clone()),this._requestedCameraState):this.transform}_applyUpdatedTransform(t){if(!this.transformCameraUpdate)return;const e=t.clone(),{center:i,zoom:s,pitch:a,bearing:o,elevation:r}=this.transformCameraUpdate(e);i&&(e.center=i),void 0!==s&&(e.zoom=s),void 0!==a&&(e.pitch=a),void 0!==o&&(e.bearing=o),void 0!==r&&(e.elevation=r),this.transform.apply(e);}_fireMoveEvents(e){this.fire(new t.Event("move",e)),this._zooming&&this.fire(new t.Event("zoom",e)),this._rotating&&this.fire(new t.Event("rotate",e)),this._pitching&&this.fire(new t.Event("pitch",e));}_afterEase(e,i){if(this._easeId&&i&&this._easeId===i)return;delete this._easeId;const s=this._zooming,a=this._rotating,o=this._pitching;this._moving=!1,this._zooming=!1,this._rotating=!1,this._pitching=!1,this._padding=!1,s&&this.fire(new t.Event("zoomend",e)),a&&this.fire(new t.Event("rotateend",e)),o&&this.fire(new t.Event("pitchend",e)),this.fire(new t.Event("moveend",e));}flyTo(e,i){if(!e.essential&&t.browser.prefersReducedMotion){const s=t.pick(e,["center","zoom","bearing","pitch","around"]);return this.jumpTo(s,i)}this.stop(),e=t.extend({offset:[0,0],speed:1.2,curve:1.42,easing:t.defaultEasing},e);const s=this._getTransformForUpdate(),a=this.getZoom(),o=this.getBearing(),r=this.getPitch(),n=this.getPadding(),l="zoom"in e?t.clamp(+e.zoom,s.minZoom,s.maxZoom):a,c="bearing"in e?this._normalizeBearing(e.bearing,o):o,h="pitch"in e?+e.pitch:r,u="padding"in e?e.padding:s.padding,d=s.zoomScale(l-a),_=t.Point.convert(e.offset);let m=s.centerPoint.add(_);const p=s.pointLocation(m),f=t.LngLat.convert(e.center||p);this._normalizeCenter(f);const g=s.project(p),v=s.project(f).sub(g);let x=e.curve;const y=Math.max(s.width,s.height),b=y/d,w=v.mag();if("minZoom"in e){const i=t.clamp(Math.min(e.minZoom,a,l),s.minZoom,s.maxZoom),o=y/s.zoomScale(i-a);x=Math.sqrt(o/w*2);}const T=x*x;function E(t){const e=(b*b-y*y+(t?-1:1)*T*T*w*w)/(2*(t?b:y)*T*w);return Math.log(Math.sqrt(e*e+1)-e)}function I(t){return (Math.exp(t)-Math.exp(-t))/2}function S(t){return (Math.exp(t)+Math.exp(-t))/2}const C=E(!1);let P=function(t){return S(C)/S(C+x*t)},D=function(t){return y*((S(C)*(I(e=C+x*t)/S(e))-I(C))/T)/w;var e;},M=(E(!0)-C)/x;if(Math.abs(w)<1e-6||!isFinite(M)){if(Math.abs(y-b)<1e-6)return this.easeTo(e,i);const t=b<y?-1:1;M=Math.abs(Math.log(b/y))/x,D=function(){return 0},P=function(e){return Math.exp(t*x*e)};}return e.duration="duration"in e?+e.duration:1e3*M/("screenSpeed"in e?+e.screenSpeed/x:+e.speed),e.maxDuration&&e.duration>e.maxDuration&&(e.duration=0),this._zooming=!0,this._rotating=o!==c,this._pitching=h!==r,this._padding=!s.isPaddingEqual(u),this._prepareEase(i,!1),this.terrain&&this._prepareElevation(f),this._ease((d=>{const p=d*M,x=1/P(p);s.zoom=1===d?l:a+s.scaleZoom(x),this._rotating&&(s.bearing=t.interpolate.number(o,c,d)),this._pitching&&(s.pitch=t.interpolate.number(r,h,d)),this._padding&&(s.interpolatePadding(n,u,d),m=s.centerPoint.add(_)),this.terrain&&!e.freezeElevation&&this._updateElevation(d);const y=1===d?f:s.unproject(g.add(v.mult(D(p))).mult(x));s.setLocationAtPoint(s.renderWorldCopies?y.wrap():y,m),this._applyUpdatedTransform(s),this._fireMoveEvents(i);}),(()=>{this.terrain&&this._finalizeElevation(),this._afterEase(i);}),e),this}isEasing(){return !!this._easeFrameId}stop(){return this._stop()}_stop(t,e){if(this._easeFrameId&&(this._cancelRenderFrame(this._easeFrameId),delete this._easeFrameId,delete this._onEaseFrame),this._onEaseEnd){const t=this._onEaseEnd;delete this._onEaseEnd,t.call(this,e);}if(!t){const t=this.handlers;t&&t.stop(!1);}return this}_ease(e,i,s){!1===s.animate||0===s.duration?(e(1),i()):(this._easeStart=t.browser.now(),this._easeOptions=s,this._onEaseFrame=e,this._onEaseEnd=i,this._easeFrameId=this._requestRenderFrame(this._renderFrameCallback));}_normalizeBearing(e,i){e=t.wrap(e,-180,180);const s=Math.abs(e-i);return Math.abs(e-360-i)<s&&(e-=360),Math.abs(e+360-i)<s&&(e+=360),e}_normalizeCenter(t){const e=this.transform;if(!e.renderWorldCopies||e.lngRange)return;const i=t.lng-e.center.lng;t.lng+=i>180?-360:i<-180?360:0;}queryTerrainElevation(e){return this.terrain?this.terrain.getElevationForLngLatZoom(t.LngLat.convert(e),this.transform.tileZoom)-this.transform.elevation:null}}class na{constructor(t={}){this._toggleAttribution=()=>{this._container.classList.contains("maplibregl-compact")&&(this._container.classList.contains("maplibregl-compact-show")?(this._container.setAttribute("open",""),this._container.classList.remove("maplibregl-compact-show")):(this._container.classList.add("maplibregl-compact-show"),this._container.removeAttribute("open")));},this._updateData=t=>{!t||"metadata"!==t.sourceDataType&&"visibility"!==t.sourceDataType&&"style"!==t.dataType&&"terrain"!==t.type||this._updateAttributions();},this._updateCompact=()=>{this._map.getCanvasContainer().offsetWidth<=640||this._compact?!1===this._compact?this._container.setAttribute("open",""):this._container.classList.contains("maplibregl-compact")||this._container.classList.contains("maplibregl-attrib-empty")||(this._container.setAttribute("open",""),this._container.classList.add("maplibregl-compact","maplibregl-compact-show")):(this._container.setAttribute("open",""),this._container.classList.contains("maplibregl-compact")&&this._container.classList.remove("maplibregl-compact","maplibregl-compact-show"));},this._updateCompactMinimize=()=>{this._container.classList.contains("maplibregl-compact")&&this._container.classList.contains("maplibregl-compact-show")&&this._container.classList.remove("maplibregl-compact-show");},this.options=t;}getDefaultPosition(){return "bottom-right"}onAdd(t){return this._map=t,this._compact=this.options&&this.options.compact,this._container=i.create("details","maplibregl-ctrl maplibregl-ctrl-attrib"),this._compactButton=i.create("summary","maplibregl-ctrl-attrib-button",this._container),this._compactButton.addEventListener("click",this._toggleAttribution),this._setElementTitle(this._compactButton,"ToggleAttribution"),this._innerContainer=i.create("div","maplibregl-ctrl-attrib-inner",this._container),this._updateAttributions(),this._updateCompact(),this._map.on("styledata",this._updateData),this._map.on("sourcedata",this._updateData),this._map.on("terrain",this._updateData),this._map.on("resize",this._updateCompact),this._map.on("drag",this._updateCompactMinimize),this._container}onRemove(){i.remove(this._container),this._map.off("styledata",this._updateData),this._map.off("sourcedata",this._updateData),this._map.off("terrain",this._updateData),this._map.off("resize",this._updateCompact),this._map.off("drag",this._updateCompactMinimize),this._map=void 0,this._compact=void 0,this._attribHTML=void 0;}_setElementTitle(t,e){const i=this._map._getUIString(`AttributionControl.${e}`);t.title=i,t.setAttribute("aria-label",i);}_updateAttributions(){if(!this._map.style)return;let t=[];if(this.options.customAttribution&&(Array.isArray(this.options.customAttribution)?t=t.concat(this.options.customAttribution.map((t=>"string"!=typeof t?"":t))):"string"==typeof this.options.customAttribution&&t.push(this.options.customAttribution)),this._map.style.stylesheet){const t=this._map.style.stylesheet;this.styleOwner=t.owner,this.styleId=t.id;}const e=this._map.style.sourceCaches;for(const i in e){const s=e[i];if(s.used||s.usedForTerrain){const e=s.getSource();e.attribution&&t.indexOf(e.attribution)<0&&t.push(e.attribution);}}t=t.filter((t=>String(t).trim())),t.sort(((t,e)=>t.length-e.length)),t=t.filter(((e,i)=>{for(let s=i+1;s<t.length;s++)if(t[s].indexOf(e)>=0)return !1;return !0}));const i=t.join(" | ");i!==this._attribHTML&&(this._attribHTML=i,t.length?(this._innerContainer.innerHTML=i,this._container.classList.remove("maplibregl-attrib-empty")):this._container.classList.add("maplibregl-attrib-empty"),this._updateCompact(),this._editLink=null);}}class la{constructor(t={}){this._updateCompact=()=>{const t=this._container.children;if(t.length){const e=t[0];this._map.getCanvasContainer().offsetWidth<=640||this._compact?!1!==this._compact&&e.classList.add("maplibregl-compact"):e.classList.remove("maplibregl-compact");}},this.options=t;}getDefaultPosition(){return "bottom-left"}onAdd(t){this._map=t,this._compact=this.options&&this.options.compact,this._container=i.create("div","maplibregl-ctrl");const e=i.create("a","maplibregl-ctrl-logo");return e.target="_blank",e.rel="noopener nofollow",e.href="https://maplibre.org/",e.setAttribute("aria-label",this._map._getUIString("LogoControl.Title")),e.setAttribute("rel","noopener nofollow"),this._container.appendChild(e),this._container.style.display="block",this._map.on("resize",this._updateCompact),this._updateCompact(),this._container}onRemove(){i.remove(this._container),this._map.off("resize",this._updateCompact),this._map=void 0,this._compact=void 0;}}class ca{constructor(){this._queue=[],this._id=0,this._cleared=!1,this._currentlyRunning=!1;}add(t){const e=++this._id;return this._queue.push({callback:t,id:e,cancelled:!1}),e}remove(t){const e=this._currentlyRunning,i=e?this._queue.concat(e):this._queue;for(const e of i)if(e.id===t)return void(e.cancelled=!0)}run(t=0){if(this._currentlyRunning)throw new Error("Attempting to run(), but is already running.");const e=this._currentlyRunning=this._queue;this._queue=[];for(const i of e)if(!i.cancelled&&(i.callback(t),this._cleared))break;this._cleared=!1,this._currentlyRunning=!1;}clear(){this._currentlyRunning&&(this._cleared=!0),this._queue=[];}}const ha={"AttributionControl.ToggleAttribution":"Toggle attribution","AttributionControl.MapFeedback":"Map feedback","FullscreenControl.Enter":"Enter fullscreen","FullscreenControl.Exit":"Exit fullscreen","GeolocateControl.FindMyLocation":"Find my location","GeolocateControl.LocationNotAvailable":"Location not available","LogoControl.Title":"Mapbox logo","NavigationControl.ResetBearing":"Reset bearing to north","NavigationControl.ZoomIn":"Zoom in","NavigationControl.ZoomOut":"Zoom out","ScaleControl.Feet":"ft","ScaleControl.Meters":"m","ScaleControl.Kilometers":"km","ScaleControl.Miles":"mi","ScaleControl.NauticalMiles":"nm","TerrainControl.enableTerrain":"Enable terrain","TerrainControl.disableTerrain":"Disable terrain"};var ua=t.createLayout([{name:"a_pos3d",type:"Int16",components:3}]);class da extends t.Evented{constructor(t){super(),this.sourceCache=t,this._tiles={},this._renderableTilesKeys=[],this._sourceTileCache={},this.minzoom=0,this.maxzoom=22,this.tileSize=512,this.deltaZoom=1,t.usedForTerrain=!0,t.tileSize=this.tileSize*2**this.deltaZoom;}destruct(){this.sourceCache.usedForTerrain=!1,this.sourceCache.tileSize=null;}update(e,i){this.sourceCache.update(e,i),this._renderableTilesKeys=[];const s={};for(const a of e.coveringTiles({tileSize:this.tileSize,minzoom:this.minzoom,maxzoom:this.maxzoom,reparseOverscaled:!1,terrain:i}))s[a.key]=!0,this._renderableTilesKeys.push(a.key),this._tiles[a.key]||(a.posMatrix=new Float64Array(16),t.ortho(a.posMatrix,0,t.EXTENT,0,t.EXTENT,0,1),this._tiles[a.key]=new W(a,this.tileSize));for(const t in this._tiles)s[t]||delete this._tiles[t];}freeRtt(t){for(const e in this._tiles){const i=this._tiles[e];(!t||i.tileID.equals(t)||i.tileID.isChildOf(t)||t.isChildOf(i.tileID))&&(i.rtt=[]);}}getRenderableTiles(){return this._renderableTilesKeys.map((t=>this.getTileByID(t)))}getTileByID(t){return this._tiles[t]}getTerrainCoords(e){const i={};for(const s of this._renderableTilesKeys){const a=this._tiles[s].tileID;if(a.canonical.equals(e.canonical)){const a=e.clone();a.posMatrix=new Float64Array(16),t.ortho(a.posMatrix,0,t.EXTENT,0,t.EXTENT,0,1),i[s]=a;}else if(a.canonical.isChildOf(e.canonical)){const o=e.clone();o.posMatrix=new Float64Array(16);const r=a.canonical.z-e.canonical.z,n=a.canonical.x-(a.canonical.x>>r<<r),l=a.canonical.y-(a.canonical.y>>r<<r),c=t.EXTENT>>r;t.ortho(o.posMatrix,0,c,0,c,0,1),t.translate(o.posMatrix,o.posMatrix,[-n*c,-l*c,0]),i[s]=o;}else if(e.canonical.isChildOf(a.canonical)){const o=e.clone();o.posMatrix=new Float64Array(16);const r=e.canonical.z-a.canonical.z,n=e.canonical.x-(e.canonical.x>>r<<r),l=e.canonical.y-(e.canonical.y>>r<<r),c=t.EXTENT>>r;t.ortho(o.posMatrix,0,t.EXTENT,0,t.EXTENT,0,1),t.translate(o.posMatrix,o.posMatrix,[n*c,l*c,0]),t.scale(o.posMatrix,o.posMatrix,[1/2**r,1/2**r,0]),i[s]=o;}}return i}getSourceTile(t,e){const i=this.sourceCache._source;let s=t.overscaledZ-this.deltaZoom;if(s>i.maxzoom&&(s=i.maxzoom),s<i.minzoom)return null;this._sourceTileCache[t.key]||(this._sourceTileCache[t.key]=t.scaledTo(s).key);let a=this.sourceCache.getTileByID(this._sourceTileCache[t.key]);if((!a||!a.dem)&&e)for(;s>=i.minzoom&&(!a||!a.dem);)a=this.sourceCache.getTileByID(t.scaledTo(s--).key);return a}tilesAfterTime(t=Date.now()){return Object.values(this._tiles).filter((e=>e.timeAdded>=t))}}class _a{constructor(t,e,i){this.painter=t,this.sourceCache=new da(e),this.options=i,this.exaggeration="number"==typeof i.exaggeration?i.exaggeration:1,this.qualityFactor=2,this.meshSize=128,this._demMatrixCache={},this.coordsIndex=[],this._coordsTextureSize=1024;}getDEMElevation(e,i,s,a=t.EXTENT){var o;if(!(i>=0&&i<a&&s>=0&&s<a))return 0;const r=this.getTerrainData(e),n=null===(o=r.tile)||void 0===o?void 0:o.dem;if(!n)return 0;const l=function(t,e,i){var s=e[0],a=e[1];return t[0]=i[0]*s+i[4]*a+i[12],t[1]=i[1]*s+i[5]*a+i[13],t}([],[i/a*t.EXTENT,s/a*t.EXTENT],r.u_terrain_matrix),c=[l[0]*n.dim,l[1]*n.dim],h=Math.floor(c[0]),u=Math.floor(c[1]),d=c[0]-h,_=c[1]-u;return n.get(h,u)*(1-d)*(1-_)+n.get(h+1,u)*d*(1-_)+n.get(h,u+1)*(1-d)*_+n.get(h+1,u+1)*d*_}getElevationForLngLatZoom(e,i){const{tileID:s,mercatorX:a,mercatorY:o}=this._getOverscaledTileIDFromLngLatZoom(e,i);return this.getElevation(s,a%t.EXTENT,o%t.EXTENT,t.EXTENT)}getElevation(e,i,s,a=t.EXTENT){return this.getDEMElevation(e,i,s,a)*this.exaggeration}getTerrainData(e){if(!this._emptyDemTexture){const e=this.painter.context,i=new t.RGBAImage({width:1,height:1},new Uint8Array(4));this._emptyDepthTexture=new x(e,i,e.gl.RGBA,{premultiply:!1}),this._emptyDemUnpack=[0,0,0,0],this._emptyDemTexture=new x(e,new t.RGBAImage({width:1,height:1}),e.gl.RGBA,{premultiply:!1}),this._emptyDemTexture.bind(e.gl.NEAREST,e.gl.CLAMP_TO_EDGE),this._emptyDemMatrix=t.identity([]);}const i=this.sourceCache.getSourceTile(e,!0);if(i&&i.dem&&(!i.demTexture||i.needsTerrainPrepare)){const t=this.painter.context;i.demTexture=this.painter.getTileTexture(i.dem.stride),i.demTexture?i.demTexture.update(i.dem.getPixels(),{premultiply:!1}):i.demTexture=new x(t,i.dem.getPixels(),t.gl.RGBA,{premultiply:!1}),i.demTexture.bind(t.gl.NEAREST,t.gl.CLAMP_TO_EDGE),i.needsTerrainPrepare=!1;}const s=i&&i+i.tileID.key+e.key;if(s&&!this._demMatrixCache[s]){const s=this.sourceCache.sourceCache._source.maxzoom;let a=e.canonical.z-i.tileID.canonical.z;e.overscaledZ>e.canonical.z&&(e.canonical.z>=s?a=e.canonical.z-s:t.warnOnce("cannot calculate elevation if elevation maxzoom > source.maxzoom"));const o=e.canonical.x-(e.canonical.x>>a<<a),r=e.canonical.y-(e.canonical.y>>a<<a),n=t.fromScaling(new Float64Array(16),[1/(t.EXTENT<<a),1/(t.EXTENT<<a),0]);t.translate(n,n,[o*t.EXTENT,r*t.EXTENT,0]),this._demMatrixCache[e.key]={matrix:n,coord:e};}return {u_depth:2,u_terrain:3,u_terrain_dim:i&&i.dem&&i.dem.dim||1,u_terrain_matrix:s?this._demMatrixCache[e.key].matrix:this._emptyDemMatrix,u_terrain_unpack:i&&i.dem&&i.dem.getUnpackVector()||this._emptyDemUnpack,u_terrain_exaggeration:this.exaggeration,texture:(i&&i.demTexture||this._emptyDemTexture).texture,depthTexture:(this._fboDepthTexture||this._emptyDepthTexture).texture,tile:i}}getFramebuffer(t){const e=this.painter,i=e.width/devicePixelRatio,s=e.height/devicePixelRatio;return !this._fbo||this._fbo.width===i&&this._fbo.height===s||(this._fbo.destroy(),this._fboCoordsTexture.destroy(),this._fboDepthTexture.destroy(),delete this._fbo,delete this._fboDepthTexture,delete this._fboCoordsTexture),this._fboCoordsTexture||(this._fboCoordsTexture=new x(e.context,{width:i,height:s,data:null},e.context.gl.RGBA,{premultiply:!1}),this._fboCoordsTexture.bind(e.context.gl.NEAREST,e.context.gl.CLAMP_TO_EDGE)),this._fboDepthTexture||(this._fboDepthTexture=new x(e.context,{width:i,height:s,data:null},e.context.gl.RGBA,{premultiply:!1}),this._fboDepthTexture.bind(e.context.gl.NEAREST,e.context.gl.CLAMP_TO_EDGE)),this._fbo||(this._fbo=e.context.createFramebuffer(i,s,!0,!1),this._fbo.depthAttachment.set(e.context.createRenderbuffer(e.context.gl.DEPTH_COMPONENT16,i,s))),this._fbo.colorAttachment.set("coords"===t?this._fboCoordsTexture.texture:this._fboDepthTexture.texture),this._fbo}getCoordsTexture(){const e=this.painter.context;if(this._coordsTexture)return this._coordsTexture;const i=new Uint8Array(this._coordsTextureSize*this._coordsTextureSize*4);for(let t=0,e=0;t<this._coordsTextureSize;t++)for(let s=0;s<this._coordsTextureSize;s++,e+=4)i[e+0]=255&s,i[e+1]=255&t,i[e+2]=s>>8<<4|t>>8,i[e+3]=0;const s=new t.RGBAImage({width:this._coordsTextureSize,height:this._coordsTextureSize},new Uint8Array(i.buffer)),a=new x(e,s,e.gl.RGBA,{premultiply:!1});return a.bind(e.gl.NEAREST,e.gl.CLAMP_TO_EDGE),this._coordsTexture=a,a}pointCoordinate(e){const i=new Uint8Array(4),s=this.painter.context,a=s.gl;s.bindFramebuffer.set(this.getFramebuffer("coords").framebuffer),a.readPixels(e.x,this.painter.height/devicePixelRatio-e.y-1,1,1,a.RGBA,a.UNSIGNED_BYTE,i),s.bindFramebuffer.set(null);const o=i[0]+(i[2]>>4<<8),r=i[1]+((15&i[2])<<8),n=this.coordsIndex[255-i[3]],l=n&&this.sourceCache.getTileByID(n);if(!l)return null;const c=this._coordsTextureSize,h=(1<<l.tileID.canonical.z)*c;return new t.MercatorCoordinate((l.tileID.canonical.x*c+o)/h,(l.tileID.canonical.y*c+r)/h,this.getElevation(l.tileID,o,r,c))}getTerrainMesh(){if(this._mesh)return this._mesh;const e=this.painter.context,i=new t.Pos3dArray,s=new t.TriangleIndexArray,a=this.meshSize,o=t.EXTENT/a,r=a*a;for(let t=0;t<=a;t++)for(let e=0;e<=a;e++)i.emplaceBack(e*o,t*o,0);for(let t=0;t<r;t+=a+1)for(let e=0;e<a;e++)s.emplaceBack(e+t,a+e+t+1,a+e+t+2),s.emplaceBack(e+t,a+e+t+2,e+t+1);const n=i.length,l=n+2*(a+1);for(const e of [0,1])for(let s=0;s<=a;s++)for(const a of [0,1])i.emplaceBack(s*o,e*t.EXTENT,a);for(let t=0;t<2*a;t+=2)s.emplaceBack(l+t,l+t+1,l+t+3),s.emplaceBack(l+t,l+t+3,l+t+2),s.emplaceBack(n+t,n+t+3,n+t+1),s.emplaceBack(n+t,n+t+2,n+t+3);const c=i.length,h=c+2*(a+1);for(const e of [0,1])for(let s=0;s<=a;s++)for(const a of [0,1])i.emplaceBack(e*t.EXTENT,s*o,a);for(let t=0;t<2*a;t+=2)s.emplaceBack(c+t,c+t+1,c+t+3),s.emplaceBack(c+t,c+t+3,c+t+2),s.emplaceBack(h+t,h+t+3,h+t+1),s.emplaceBack(h+t,h+t+2,h+t+3);return this._mesh={indexBuffer:e.createIndexBuffer(s),vertexBuffer:e.createVertexBuffer(i,ua.members),segments:t.SegmentVector.simpleSegment(0,0,i.length,s.length)},this._mesh}getMeshFrameDelta(e){return 2*Math.PI*t.earthRadius/Math.pow(2,e)/5}getMinTileElevationForLngLatZoom(t,e){var i;const{tileID:s}=this._getOverscaledTileIDFromLngLatZoom(t,e);return null!==(i=this.getMinMaxElevation(s).minElevation)&&void 0!==i?i:0}getMinMaxElevation(t){const e=this.getTerrainData(t).tile,i={minElevation:null,maxElevation:null};return e&&e.dem&&(i.minElevation=e.dem.min*this.exaggeration,i.maxElevation=e.dem.max*this.exaggeration),i}_getOverscaledTileIDFromLngLatZoom(e,i){const s=t.MercatorCoordinate.fromLngLat(e.wrap()),a=(1<<i)*t.EXTENT,o=s.x*a,r=s.y*a,n=Math.floor(o/t.EXTENT),l=Math.floor(r/t.EXTENT);return {tileID:new t.OverscaledTileID(i,0,i,n,l),mercatorX:o,mercatorY:r}}}class ma{constructor(t,e,i){this._context=t,this._size=e,this._tileSize=i,this._objects=[],this._recentlyUsed=[],this._stamp=0;}destruct(){for(const t of this._objects)t.texture.destroy(),t.fbo.destroy();}_createObject(t){const e=this._context.createFramebuffer(this._tileSize,this._tileSize,!0,!0),i=new x(this._context,{width:this._tileSize,height:this._tileSize,data:null},this._context.gl.RGBA);return i.bind(this._context.gl.LINEAR,this._context.gl.CLAMP_TO_EDGE),e.depthAttachment.set(this._context.createRenderbuffer(this._context.gl.DEPTH_STENCIL,this._tileSize,this._tileSize)),e.colorAttachment.set(i.texture),{id:t,fbo:e,texture:i,stamp:-1,inUse:!1}}getObjectForId(t){return this._objects[t]}useObject(t){t.inUse=!0,this._recentlyUsed=this._recentlyUsed.filter((e=>t.id!==e)),this._recentlyUsed.push(t.id);}stampObject(t){t.stamp=++this._stamp;}getOrCreateFreeObject(){for(const t of this._recentlyUsed)if(!this._objects[t].inUse)return this._objects[t];if(this._objects.length>=this._size)throw new Error("No free RenderPool available, call freeAllObjects() required!");const t=this._createObject(this._objects.length);return this._objects.push(t),t}freeObject(t){t.inUse=!1;}freeAllObjects(){for(const t of this._objects)this.freeObject(t);}isFull(){return !(this._objects.length<this._size)&&!1===this._objects.some((t=>!t.inUse))}}const pa={background:!0,fill:!0,line:!0,raster:!0,hillshade:!0};class fa{constructor(t,e){this.painter=t,this.terrain=e,this.pool=new ma(t.context,30,e.sourceCache.tileSize*e.qualityFactor);}destruct(){this.pool.destruct();}getTexture(t){return this.pool.getObjectForId(t.rtt[this._stacks.length-1].id).texture}prepareForRender(t,e){this._stacks=[],this._prevType=null,this._rttTiles=[],this._renderableTiles=this.terrain.sourceCache.getRenderableTiles(),this._renderableLayerIds=t._order.filter((i=>!t._layers[i].isHidden(e))),this._coordsDescendingInv={};for(const e in t.sourceCaches){this._coordsDescendingInv[e]={};const i=t.sourceCaches[e].getVisibleCoordinates();for(const t of i){const i=this.terrain.sourceCache.getTerrainCoords(t);for(const t in i)this._coordsDescendingInv[e][t]||(this._coordsDescendingInv[e][t]=[]),this._coordsDescendingInv[e][t].push(i[t]);}}this._coordsDescendingInvStr={};for(const e of t._order){const i=t._layers[e],s=i.source;if(pa[i.type]&&!this._coordsDescendingInvStr[s]){this._coordsDescendingInvStr[s]={};for(const t in this._coordsDescendingInv[s])this._coordsDescendingInvStr[s][t]=this._coordsDescendingInv[s][t].map((t=>t.key)).sort().join();}}for(const t of this._renderableTiles)for(const e in this._coordsDescendingInvStr){const i=this._coordsDescendingInvStr[e][t.tileID.key];i&&i!==t.rttCoords[e]&&(t.rtt=[]);}}renderLayer(e){if(e.isHidden(this.painter.transform.zoom))return !1;const i=e.type,s=this.painter,a=this._renderableLayerIds[this._renderableLayerIds.length-1]===e.id;if(pa[i]&&(this._prevType&&pa[this._prevType]||this._stacks.push([]),this._prevType=i,this._stacks[this._stacks.length-1].push(e.id),!a))return !0;if(pa[this._prevType]||pa[i]&&a){this._prevType=i;const e=this._stacks.length-1,a=this._stacks[e]||[];for(const i of this._renderableTiles){if(this.pool.isFull()&&(is(this.painter,this.terrain,this._rttTiles),this._rttTiles=[],this.pool.freeAllObjects()),this._rttTiles.push(i),i.rtt[e]){const t=this.pool.getObjectForId(i.rtt[e].id);if(t.stamp===i.rtt[e].stamp){this.pool.useObject(t);continue}}const o=this.pool.getOrCreateFreeObject();this.pool.useObject(o),this.pool.stampObject(o),i.rtt[e]={id:o.id,stamp:o.stamp},s.context.bindFramebuffer.set(o.fbo.framebuffer),s.context.clear({color:t.Color.transparent,stencil:0}),s.currentStencilSource=void 0;for(let t=0;t<a.length;t++){const e=s.style._layers[a[t]],r=e.source?this._coordsDescendingInv[e.source][i.tileID.key]:[i.tileID];s.context.viewport.set([0,0,o.fbo.width,o.fbo.height]),s._renderTileClippingMasks(e,r),s.renderLayer(s,s.style.sourceCaches[e.source],e,r),e.source&&(i.rttCoords[e.source]=this._coordsDescendingInvStr[e.source][i.tileID.key]);}}return is(this.painter,this.terrain,this._rttTiles),this._rttTiles=[],this.pool.freeAllObjects(),pa[i]}return !1}}const ga=e,va={center:[0,0],zoom:0,bearing:0,pitch:0,minZoom:-2,maxZoom:22,minPitch:0,maxPitch:60,interactive:!0,scrollZoom:!0,boxZoom:!0,dragRotate:!0,dragPan:!0,keyboard:!0,doubleClickZoom:!0,touchZoomRotate:!0,touchPitch:!0,cooperativeGestures:void 0,bearingSnap:7,clickTolerance:3,pitchWithRotate:!0,hash:!1,attributionControl:!0,maplibreLogo:!1,failIfMajorPerformanceCaveat:!1,preserveDrawingBuffer:!1,trackResize:!0,renderWorldCopies:!0,refreshExpiredTiles:!0,maxTileCacheSize:null,maxTileCacheZoomLevels:t.config.MAX_TILE_CACHE_ZOOM_LEVELS,localIdeographFontFamily:"sans-serif",transformRequest:null,transformCameraUpdate:null,fadeDuration:300,crossSourceCollisions:!0,validateStyle:!0,maxCanvasSize:[4096,4096]},xa=t=>{t.touchstart=t.dragStart,t.touchmoveWindow=t.dragMove,t.touchend=t.dragEnd;},ya={showCompass:!0,showZoom:!0,visualizePitch:!1};class ba{constructor(e,s,a=!1){this.mousedown=e=>{this.startMouse(t.extend({},e,{ctrlKey:!0,preventDefault:()=>e.preventDefault()}),i.mousePos(this.element,e)),i.addEventListener(window,"mousemove",this.mousemove),i.addEventListener(window,"mouseup",this.mouseup);},this.mousemove=t=>{this.moveMouse(t,i.mousePos(this.element,t));},this.mouseup=t=>{this.mouseRotate.dragEnd(t),this.mousePitch&&this.mousePitch.dragEnd(t),this.offTemp();},this.touchstart=t=>{1!==t.targetTouches.length?this.reset():(this._startPos=this._lastPos=i.touchPos(this.element,t.targetTouches)[0],this.startTouch(t,this._startPos),i.addEventListener(window,"touchmove",this.touchmove,{passive:!1}),i.addEventListener(window,"touchend",this.touchend));},this.touchmove=t=>{1!==t.targetTouches.length?this.reset():(this._lastPos=i.touchPos(this.element,t.targetTouches)[0],this.moveTouch(t,this._lastPos));},this.touchend=t=>{0===t.targetTouches.length&&this._startPos&&this._lastPos&&this._startPos.dist(this._lastPos)<this._clickTolerance&&this.element.click(),delete this._startPos,delete this._lastPos,this.offTemp();},this.reset=()=>{this.mouseRotate.reset(),this.mousePitch&&this.mousePitch.reset(),this.touchRotate.reset(),this.touchPitch&&this.touchPitch.reset(),delete this._startPos,delete this._lastPos,this.offTemp();},this._clickTolerance=10;const o=e.dragRotate._mouseRotate.getClickTolerance(),r=e.dragRotate._mousePitch.getClickTolerance();this.element=s,this.mouseRotate=Rs({clickTolerance:o,enable:!0}),this.touchRotate=(({enable:t,clickTolerance:e,bearingDegreesPerPixelMoved:i=.8})=>{const s=new As;return new Ds({clickTolerance:e,move:(t,e)=>({bearingDelta:(e.x-t.x)*i}),moveStateManager:s,enable:t,assignEvents:xa})})({clickTolerance:o,enable:!0}),this.map=e,a&&(this.mousePitch=ks({clickTolerance:r,enable:!0}),this.touchPitch=(({enable:t,clickTolerance:e,pitchDegreesPerPixelMoved:i=-.5})=>{const s=new As;return new Ds({clickTolerance:e,move:(t,e)=>({pitchDelta:(e.y-t.y)*i}),moveStateManager:s,enable:t,assignEvents:xa})})({clickTolerance:r,enable:!0})),i.addEventListener(s,"mousedown",this.mousedown),i.addEventListener(s,"touchstart",this.touchstart,{passive:!1}),i.addEventListener(s,"touchcancel",this.reset);}startMouse(t,e){this.mouseRotate.dragStart(t,e),this.mousePitch&&this.mousePitch.dragStart(t,e),i.disableDrag();}startTouch(t,e){this.touchRotate.dragStart(t,e),this.touchPitch&&this.touchPitch.dragStart(t,e),i.disableDrag();}moveMouse(t,e){const i=this.map,{bearingDelta:s}=this.mouseRotate.dragMove(t,e)||{};if(s&&i.setBearing(i.getBearing()+s),this.mousePitch){const{pitchDelta:s}=this.mousePitch.dragMove(t,e)||{};s&&i.setPitch(i.getPitch()+s);}}moveTouch(t,e){const i=this.map,{bearingDelta:s}=this.touchRotate.dragMove(t,e)||{};if(s&&i.setBearing(i.getBearing()+s),this.touchPitch){const{pitchDelta:s}=this.touchPitch.dragMove(t,e)||{};s&&i.setPitch(i.getPitch()+s);}}off(){const t=this.element;i.removeEventListener(t,"mousedown",this.mousedown),i.removeEventListener(t,"touchstart",this.touchstart,{passive:!1}),i.removeEventListener(window,"touchmove",this.touchmove,{passive:!1}),i.removeEventListener(window,"touchend",this.touchend),i.removeEventListener(t,"touchcancel",this.reset),this.offTemp();}offTemp(){i.enableDrag(),i.removeEventListener(window,"mousemove",this.mousemove),i.removeEventListener(window,"mouseup",this.mouseup),i.removeEventListener(window,"touchmove",this.touchmove,{passive:!1}),i.removeEventListener(window,"touchend",this.touchend);}}let wa;function Ta(e,i,s){if(e=new t.LngLat(e.lng,e.lat),i){const a=new t.LngLat(e.lng-360,e.lat),o=new t.LngLat(e.lng+360,e.lat),r=s.locationPoint(e).distSqr(i);s.locationPoint(a).distSqr(i)<r?e=a:s.locationPoint(o).distSqr(i)<r&&(e=o);}for(;Math.abs(e.lng-s.center.lng)>180;){const t=s.locationPoint(e);if(t.x>=0&&t.y>=0&&t.x<=s.width&&t.y<=s.height)break;e.lng>s.center.lng?e.lng-=360:e.lng+=360;}return e}const Ea={center:"translate(-50%,-50%)",top:"translate(-50%,0)","top-left":"translate(0,0)","top-right":"translate(-100%,0)",bottom:"translate(-50%,-100%)","bottom-left":"translate(0,-100%)","bottom-right":"translate(-100%,-100%)",left:"translate(0,-50%)",right:"translate(-100%,-50%)"};function Ia(t,e,i){const s=t.classList;for(const t in Ea)s.remove(`maplibregl-${i}-anchor-${t}`);s.add(`maplibregl-${i}-anchor-${e}`);}class Sa extends t.Evented{constructor(e){if(super(),this._onKeyPress=t=>{const e=t.code,i=t.charCode||t.keyCode;"Space"!==e&&"Enter"!==e&&32!==i&&13!==i||this.togglePopup();},this._onMapClick=t=>{const e=t.originalEvent.target,i=this._element;this._popup&&(e===i||i.contains(e))&&this.togglePopup();},this._update=t=>{if(!this._map)return;this._map.transform.renderWorldCopies&&(this._lngLat=Ta(this._lngLat,this._pos,this._map.transform)),this._pos=this._map.project(this._lngLat)._add(this._offset);let e="";"viewport"===this._rotationAlignment||"auto"===this._rotationAlignment?e=`rotateZ(${this._rotation}deg)`:"map"===this._rotationAlignment&&(e=`rotateZ(${this._rotation-this._map.getBearing()}deg)`);let s="";"viewport"===this._pitchAlignment||"auto"===this._pitchAlignment?s="rotateX(0deg)":"map"===this._pitchAlignment&&(s=`rotateX(${this._map.getPitch()}deg)`),t&&"moveend"!==t.type||(this._pos=this._pos.round()),i.setTransform(this._element,`${Ea[this._anchor]} translate(${this._pos.x}px, ${this._pos.y}px) ${s} ${e}`),this._map.terrain&&!this._opacityTimeout&&(this._opacityTimeout=setTimeout((()=>{const t=this._map.unproject(this._pos),e=40075016.686*Math.abs(Math.cos(this._lngLat.lat*Math.PI/180))/Math.pow(2,this._map.transform.tileZoom+8);this._element.style.opacity=t.distanceTo(this._lngLat)>20*e?"0.2":"1.0",this._opacityTimeout=null;}),100));},this._onMove=e=>{if(!this._isDragging){const t=this._clickTolerance||this._map._clickTolerance;this._isDragging=e.point.dist(this._pointerdownPos)>=t;}this._isDragging&&(this._pos=e.point.sub(this._positionDelta),this._lngLat=this._map.unproject(this._pos),this.setLngLat(this._lngLat),this._element.style.pointerEvents="none","pending"===this._state&&(this._state="active",this.fire(new t.Event("dragstart"))),this.fire(new t.Event("drag")));},this._onUp=()=>{this._element.style.pointerEvents="auto",this._positionDelta=null,this._pointerdownPos=null,this._isDragging=!1,this._map.off("mousemove",this._onMove),this._map.off("touchmove",this._onMove),"active"===this._state&&this.fire(new t.Event("dragend")),this._state="inactive";},this._addDragHandler=t=>{this._element.contains(t.originalEvent.target)&&(t.preventDefault(),this._positionDelta=t.point.sub(this._pos).add(this._offset),this._pointerdownPos=t.point,this._state="pending",this._map.on("mousemove",this._onMove),this._map.on("touchmove",this._onMove),this._map.once("mouseup",this._onUp),this._map.once("touchend",this._onUp));},this._anchor=e&&e.anchor||"center",this._color=e&&e.color||"#3FB1CE",this._scale=e&&e.scale||1,this._draggable=e&&e.draggable||!1,this._clickTolerance=e&&e.clickTolerance||0,this._isDragging=!1,this._state="inactive",this._rotation=e&&e.rotation||0,this._rotationAlignment=e&&e.rotationAlignment||"auto",this._pitchAlignment=e&&e.pitchAlignment&&"auto"!==e.pitchAlignment?e.pitchAlignment:this._rotationAlignment,e&&e.element)this._element=e.element,this._offset=t.Point.convert(e&&e.offset||[0,0]);else {this._defaultMarker=!0,this._element=i.create("div"),this._element.setAttribute("aria-label","Map marker");const s=i.createNS("http://www.w3.org/2000/svg","svg"),a=41,o=27;s.setAttributeNS(null,"display","block"),s.setAttributeNS(null,"height",`${a}px`),s.setAttributeNS(null,"width",`${o}px`),s.setAttributeNS(null,"viewBox",`0 0 ${o} ${a}`);const r=i.createNS("http://www.w3.org/2000/svg","g");r.setAttributeNS(null,"stroke","none"),r.setAttributeNS(null,"stroke-width","1"),r.setAttributeNS(null,"fill","none"),r.setAttributeNS(null,"fill-rule","evenodd");const n=i.createNS("http://www.w3.org/2000/svg","g");n.setAttributeNS(null,"fill-rule","nonzero");const l=i.createNS("http://www.w3.org/2000/svg","g");l.setAttributeNS(null,"transform","translate(3.0, 29.0)"),l.setAttributeNS(null,"fill","#000000");const c=[{rx:"10.5",ry:"5.25002273"},{rx:"10.5",ry:"5.25002273"},{rx:"9.5",ry:"4.77275007"},{rx:"8.5",ry:"4.29549936"},{rx:"7.5",ry:"3.81822308"},{rx:"6.5",ry:"3.34094679"},{rx:"5.5",ry:"2.86367051"},{rx:"4.5",ry:"2.38636864"}];for(const t of c){const e=i.createNS("http://www.w3.org/2000/svg","ellipse");e.setAttributeNS(null,"opacity","0.04"),e.setAttributeNS(null,"cx","10.5"),e.setAttributeNS(null,"cy","5.80029008"),e.setAttributeNS(null,"rx",t.rx),e.setAttributeNS(null,"ry",t.ry),l.appendChild(e);}const h=i.createNS("http://www.w3.org/2000/svg","g");h.setAttributeNS(null,"fill",this._color);const u=i.createNS("http://www.w3.org/2000/svg","path");u.setAttributeNS(null,"d","M27,13.5 C27,19.074644 20.250001,27.000002 14.75,34.500002 C14.016665,35.500004 12.983335,35.500004 12.25,34.500002 C6.7499993,27.000002 0,19.222562 0,13.5 C0,6.0441559 6.0441559,0 13.5,0 C20.955844,0 27,6.0441559 27,13.5 Z"),h.appendChild(u);const d=i.createNS("http://www.w3.org/2000/svg","g");d.setAttributeNS(null,"opacity","0.25"),d.setAttributeNS(null,"fill","#000000");const _=i.createNS("http://www.w3.org/2000/svg","path");_.setAttributeNS(null,"d","M13.5,0 C6.0441559,0 0,6.0441559 0,13.5 C0,19.222562 6.7499993,27 12.25,34.5 C13,35.522727 14.016664,35.500004 14.75,34.5 C20.250001,27 27,19.074644 27,13.5 C27,6.0441559 20.955844,0 13.5,0 Z M13.5,1 C20.415404,1 26,6.584596 26,13.5 C26,15.898657 24.495584,19.181431 22.220703,22.738281 C19.945823,26.295132 16.705119,30.142167 13.943359,33.908203 C13.743445,34.180814 13.612715,34.322738 13.5,34.441406 C13.387285,34.322738 13.256555,34.180814 13.056641,33.908203 C10.284481,30.127985 7.4148684,26.314159 5.015625,22.773438 C2.6163816,19.232715 1,15.953538 1,13.5 C1,6.584596 6.584596,1 13.5,1 Z"),d.appendChild(_);const m=i.createNS("http://www.w3.org/2000/svg","g");m.setAttributeNS(null,"transform","translate(6.0, 7.0)"),m.setAttributeNS(null,"fill","#FFFFFF");const p=i.createNS("http://www.w3.org/2000/svg","g");p.setAttributeNS(null,"transform","translate(8.0, 8.0)");const f=i.createNS("http://www.w3.org/2000/svg","circle");f.setAttributeNS(null,"fill","#000000"),f.setAttributeNS(null,"opacity","0.25"),f.setAttributeNS(null,"cx","5.5"),f.setAttributeNS(null,"cy","5.5"),f.setAttributeNS(null,"r","5.4999962");const g=i.createNS("http://www.w3.org/2000/svg","circle");g.setAttributeNS(null,"fill","#FFFFFF"),g.setAttributeNS(null,"cx","5.5"),g.setAttributeNS(null,"cy","5.5"),g.setAttributeNS(null,"r","5.4999962"),p.appendChild(f),p.appendChild(g),n.appendChild(l),n.appendChild(h),n.appendChild(d),n.appendChild(m),n.appendChild(p),s.appendChild(n),s.setAttributeNS(null,"height",a*this._scale+"px"),s.setAttributeNS(null,"width",o*this._scale+"px"),this._element.appendChild(s),this._offset=t.Point.convert(e&&e.offset||[0,-14]);}if(this._element.classList.add("maplibregl-marker"),this._element.addEventListener("dragstart",(t=>{t.preventDefault();})),this._element.addEventListener("mousedown",(t=>{t.preventDefault();})),Ia(this._element,this._anchor,"marker"),e&&e.className)for(const t of e.className.split(" "))this._element.classList.add(t);this._popup=null;}addTo(t){return this.remove(),this._map=t,t.getCanvasContainer().appendChild(this._element),t.on("move",this._update),t.on("moveend",this._update),this.setDraggable(this._draggable),this._update(),this._map.on("click",this._onMapClick),this}remove(){return this._opacityTimeout&&(clearTimeout(this._opacityTimeout),delete this._opacityTimeout),this._map&&(this._map.off("click",this._onMapClick),this._map.off("move",this._update),this._map.off("moveend",this._update),this._map.off("mousedown",this._addDragHandler),this._map.off("touchstart",this._addDragHandler),this._map.off("mouseup",this._onUp),this._map.off("touchend",this._onUp),this._map.off("mousemove",this._onMove),this._map.off("touchmove",this._onMove),delete this._map),i.remove(this._element),this._popup&&this._popup.remove(),this}getLngLat(){return this._lngLat}setLngLat(e){return this._lngLat=t.LngLat.convert(e),this._pos=null,this._popup&&this._popup.setLngLat(this._lngLat),this._update(),this}getElement(){return this._element}setPopup(t){if(this._popup&&(this._popup.remove(),this._popup=null,this._element.removeEventListener("keypress",this._onKeyPress),this._originalTabIndex||this._element.removeAttribute("tabindex")),t){if(!("offset"in t.options)){const e=38.1,i=13.5,s=Math.abs(i)/Math.SQRT2;t.options.offset=this._defaultMarker?{top:[0,0],"top-left":[0,0],"top-right":[0,0],bottom:[0,-e],"bottom-left":[s,-1*(e-i+s)],"bottom-right":[-s,-1*(e-i+s)],left:[i,-1*(e-i)],right:[-i,-1*(e-i)]}:this._offset;}this._popup=t,this._lngLat&&this._popup.setLngLat(this._lngLat),this._originalTabIndex=this._element.getAttribute("tabindex"),this._originalTabIndex||this._element.setAttribute("tabindex","0"),this._element.addEventListener("keypress",this._onKeyPress);}return this}getPopup(){return this._popup}togglePopup(){const t=this._popup;return t?(t.isOpen()?t.remove():t.addTo(this._map),this):this}getOffset(){return this._offset}setOffset(e){return this._offset=t.Point.convert(e),this._update(),this}addClassName(t){this._element.classList.add(t);}removeClassName(t){this._element.classList.remove(t);}toggleClassName(t){return this._element.classList.toggle(t)}setDraggable(t){return this._draggable=!!t,this._map&&(t?(this._map.on("mousedown",this._addDragHandler),this._map.on("touchstart",this._addDragHandler)):(this._map.off("mousedown",this._addDragHandler),this._map.off("touchstart",this._addDragHandler))),this}isDraggable(){return this._draggable}setRotation(t){return this._rotation=t||0,this._update(),this}getRotation(){return this._rotation}setRotationAlignment(t){return this._rotationAlignment=t||"auto",this._update(),this}getRotationAlignment(){return this._rotationAlignment}setPitchAlignment(t){return this._pitchAlignment=t&&"auto"!==t?t:this._rotationAlignment,this._update(),this}getPitchAlignment(){return this._pitchAlignment}}const Ca={positionOptions:{enableHighAccuracy:!1,maximumAge:0,timeout:6e3},fitBoundsOptions:{maxZoom:15},trackUserLocation:!1,showAccuracyCircle:!0,showUserLocation:!0};let Pa=0,Da=!1;const Ma={maxWidth:100,unit:"metric"};function za(t,e,i){const s=i&&i.maxWidth||100,a=t._container.clientHeight/2,o=t.unproject([0,a]),r=t.unproject([s,a]),n=o.distanceTo(r);if(i&&"imperial"===i.unit){const i=3.2808*n;i>5280?Aa(e,s,i/5280,t._getUIString("ScaleControl.Miles")):Aa(e,s,i,t._getUIString("ScaleControl.Feet"));}else i&&"nautical"===i.unit?Aa(e,s,n/1852,t._getUIString("ScaleControl.NauticalMiles")):n>=1e3?Aa(e,s,n/1e3,t._getUIString("ScaleControl.Kilometers")):Aa(e,s,n,t._getUIString("ScaleControl.Meters"));}function Aa(t,e,i,s){const a=function(t){const e=Math.pow(10,`${Math.floor(t)}`.length-1);let i=t/e;return i=i>=10?10:i>=5?5:i>=3?3:i>=2?2:i>=1?1:function(t){const e=Math.pow(10,Math.ceil(-Math.log(t)/Math.LN10));return Math.round(t*e)/e}(i),e*i}(i);t.style.width=e*(a/i)+"px",t.innerHTML=`${a}&nbsp;${s}`;}const La={closeButton:!0,closeOnClick:!0,focusAfterOpen:!0,className:"",maxWidth:"240px"},Ra=["a[href]","[tabindex]:not([tabindex='-1'])","[contenteditable]:not([contenteditable='false'])","button:not([disabled])","input:not([disabled])","select:not([disabled])","textarea:not([disabled])"].join(", ");function ka(e){if(e){if("number"==typeof e){const i=Math.round(Math.abs(e)/Math.SQRT2);return {center:new t.Point(0,0),top:new t.Point(0,e),"top-left":new t.Point(i,i),"top-right":new t.Point(-i,i),bottom:new t.Point(0,-e),"bottom-left":new t.Point(i,-i),"bottom-right":new t.Point(-i,-i),left:new t.Point(e,0),right:new t.Point(-e,0)}}if(e instanceof t.Point||Array.isArray(e)){const i=t.Point.convert(e);return {center:i,top:i,"top-left":i,"top-right":i,bottom:i,"bottom-left":i,"bottom-right":i,left:i,right:i}}return {center:t.Point.convert(e.center||[0,0]),top:t.Point.convert(e.top||[0,0]),"top-left":t.Point.convert(e["top-left"]||[0,0]),"top-right":t.Point.convert(e["top-right"]||[0,0]),bottom:t.Point.convert(e.bottom||[0,0]),"bottom-left":t.Point.convert(e["bottom-left"]||[0,0]),"bottom-right":t.Point.convert(e["bottom-right"]||[0,0]),left:t.Point.convert(e.left||[0,0]),right:t.Point.convert(e.right||[0,0])}}return ka(new t.Point(0,0))}const Fa={extend:(e,...i)=>t.extend(e,...i),run(t){t();},logToElement(t,e=!1,i="log"){const s=window.document.getElementById(i);s&&(e&&(s.innerHTML=""),s.innerHTML+=`<br>${t}`);}},Ba=e;class Ua{static get version(){return Ba}static get workerCount(){return et.workerCount}static set workerCount(t){et.workerCount=t;}static get maxParallelImageRequests(){return t.config.MAX_PARALLEL_IMAGE_REQUESTS}static set maxParallelImageRequests(e){t.config.MAX_PARALLEL_IMAGE_REQUESTS=e;}static get workerUrl(){return t.config.WORKER_URL}static set workerUrl(e){t.config.WORKER_URL=e;}static addProtocol(e,i){t.config.REGISTERED_PROTOCOLS[e]=i;}static removeProtocol(e){delete t.config.REGISTERED_PROTOCOLS[e];}}return Ua.Map=class extends ra{constructor(e){if(t.PerformanceUtils.mark(t.PerformanceMarkers.create),null!=(e=t.extend({},va,e)).minZoom&&null!=e.maxZoom&&e.minZoom>e.maxZoom)throw new Error("maxZoom must be greater than or equal to minZoom");if(null!=e.minPitch&&null!=e.maxPitch&&e.minPitch>e.maxPitch)throw new Error("maxPitch must be greater than or equal to minPitch");if(null!=e.minPitch&&e.minPitch<0)throw new Error("minPitch must be greater than or equal to 0");if(null!=e.maxPitch&&e.maxPitch>85)throw new Error("maxPitch must be less than or equal to 85");if(super(new ns(e.minZoom,e.maxZoom,e.minPitch,e.maxPitch,e.renderWorldCopies),{bearingSnap:e.bearingSnap}),this._cooperativeGesturesOnWheel=t=>{this._onCooperativeGesture(t,t[this._metaKey],1);},this._contextLost=e=>{e.preventDefault(),this._frame&&(this._frame.cancel(),this._frame=null),this.fire(new t.Event("webglcontextlost",{originalEvent:e}));},this._contextRestored=e=>{this._setupPainter(),this.resize(),this._update(),this.fire(new t.Event("webglcontextrestored",{originalEvent:e}));},this._onMapScroll=t=>{if(t.target===this._container)return this._container.scrollTop=0,this._container.scrollLeft=0,!1},this._onWindowOnline=()=>{this._update();},this._interactive=e.interactive,this._cooperativeGestures=e.cooperativeGestures,this._metaKey=0===navigator.platform.indexOf("Mac")?"metaKey":"ctrlKey",this._maxTileCacheSize=e.maxTileCacheSize,this._maxTileCacheZoomLevels=e.maxTileCacheZoomLevels,this._failIfMajorPerformanceCaveat=e.failIfMajorPerformanceCaveat,this._preserveDrawingBuffer=e.preserveDrawingBuffer,this._antialias=e.antialias,this._trackResize=e.trackResize,this._bearingSnap=e.bearingSnap,this._refreshExpiredTiles=e.refreshExpiredTiles,this._fadeDuration=e.fadeDuration,this._crossSourceCollisions=e.crossSourceCollisions,this._crossFadingFactor=1,this._collectResourceTiming=e.collectResourceTiming,this._renderTaskQueue=new ca,this._controls=[],this._mapId=t.uniqueId(),this._locale=t.extend({},ha,e.locale),this._clickTolerance=e.clickTolerance,this._overridePixelRatio=e.pixelRatio,this._maxCanvasSize=e.maxCanvasSize,this.transformCameraUpdate=e.transformCameraUpdate,this._imageQueueHandle=c.addThrottleControl((()=>this.isMoving())),this._requestManager=new u(e.transformRequest),"string"==typeof e.container){if(this._container=document.getElementById(e.container),!this._container)throw new Error(`Container '${e.container}' not found.`)}else {if(!(e.container instanceof HTMLElement))throw new Error("Invalid type: 'container' must be a String or HTMLElement.");this._container=e.container;}if(e.maxBounds&&this.setMaxBounds(e.maxBounds),this._setupContainer(),this._setupPainter(),this.on("move",(()=>this._update(!1))),this.on("moveend",(()=>this._update(!1))),this.on("zoom",(()=>this._update(!0))),this.on("terrain",(()=>{this.painter.terrainFacilitator.dirty=!0,this._update(!0);})),this.once("idle",(()=>{this._idleTriggered=!0;})),"undefined"!=typeof window){addEventListener("online",this._onWindowOnline,!1);let t=!1;const e=ls((t=>{this._trackResize&&!this._removed&&this.resize(t)._update();}),50);this._resizeObserver=new ResizeObserver((i=>{t?e(i):t=!0;})),this._resizeObserver.observe(this._container);}this.handlers=new oa(this,e),this._cooperativeGestures&&this._setupCooperativeGestures(),this._hash=e.hash&&new cs("string"==typeof e.hash&&e.hash||void 0).addTo(this),this._hash&&this._hash._onHashChange()||(this.jumpTo({center:e.center,zoom:e.zoom,bearing:e.bearing,pitch:e.pitch}),e.bounds&&(this.resize(),this.fitBounds(e.bounds,t.extend({},e.fitBoundsOptions,{duration:0})))),this.resize(),this._localIdeographFontFamily=e.localIdeographFontFamily,this._validateStyle=e.validateStyle,e.style&&this.setStyle(e.style,{localIdeographFontFamily:e.localIdeographFontFamily}),e.attributionControl&&this.addControl(new na({customAttribution:e.customAttribution})),e.maplibreLogo&&this.addControl(new la,e.logoPosition),this.on("style.load",(()=>{this.transform.unmodified&&this.jumpTo(this.style.stylesheet);})),this.on("data",(e=>{this._update("style"===e.dataType),this.fire(new t.Event(`${e.dataType}data`,e));})),this.on("dataloading",(e=>{this.fire(new t.Event(`${e.dataType}dataloading`,e));})),this.on("dataabort",(e=>{this.fire(new t.Event("sourcedataabort",e));}));}_getMapId(){return this._mapId}addControl(e,i){if(void 0===i&&(i=e.getDefaultPosition?e.getDefaultPosition():"top-right"),!e||!e.onAdd)return this.fire(new t.ErrorEvent(new Error("Invalid argument to map.addControl(). Argument must be a control with onAdd and onRemove methods.")));const s=e.onAdd(this);this._controls.push(e);const a=this._controlPositions[i];return -1!==i.indexOf("bottom")?a.insertBefore(s,a.firstChild):a.appendChild(s),this}removeControl(e){if(!e||!e.onRemove)return this.fire(new t.ErrorEvent(new Error("Invalid argument to map.removeControl(). Argument must be a control with onAdd and onRemove methods.")));const i=this._controls.indexOf(e);return i>-1&&this._controls.splice(i,1),e.onRemove(this),this}hasControl(t){return this._controls.indexOf(t)>-1}calculateCameraOptionsFromTo(t,e,i,s){return null==s&&this.terrain&&(s=this.terrain.getElevationForLngLatZoom(i,this.transform.tileZoom)),super.calculateCameraOptionsFromTo(t,e,i,s)}resize(e){var i;const s=this._containerDimensions(),a=s[0],o=s[1],r=this._getClampedPixelRatio(a,o);if(this._resizeCanvas(a,o,r),this.painter.resize(a,o,r),this.painter.overLimit()){const t=this.painter.context.gl;this._maxCanvasSize=[t.drawingBufferWidth,t.drawingBufferHeight];const e=this._getClampedPixelRatio(a,o);this._resizeCanvas(a,o,e),this.painter.resize(a,o,e);}this.transform.resize(a,o),null===(i=this._requestedCameraState)||void 0===i||i.resize(a,o);const n=!this._moving;return n&&(this.stop(),this.fire(new t.Event("movestart",e)).fire(new t.Event("move",e))),this.fire(new t.Event("resize",e)),n&&this.fire(new t.Event("moveend",e)),this}_getClampedPixelRatio(t,e){const{0:i,1:s}=this._maxCanvasSize,a=this.getPixelRatio(),o=t*a,r=e*a;return Math.min(o>i?i/o:1,r>s?s/r:1)*a}getPixelRatio(){var t;return null!==(t=this._overridePixelRatio)&&void 0!==t?t:devicePixelRatio}setPixelRatio(t){this._overridePixelRatio=t,this.resize();}getBounds(){return this.transform.getBounds()}getMaxBounds(){return this.transform.getMaxBounds()}setMaxBounds(t){return this.transform.setMaxBounds(L.convert(t)),this._update()}setMinZoom(t){if((t=null==t?-2:t)>=-2&&t<=this.transform.maxZoom)return this.transform.minZoom=t,this._update(),this.getZoom()<t&&this.setZoom(t),this;throw new Error("minZoom must be between -2 and the current maxZoom, inclusive")}getMinZoom(){return this.transform.minZoom}setMaxZoom(t){if((t=null==t?22:t)>=this.transform.minZoom)return this.transform.maxZoom=t,this._update(),this.getZoom()>t&&this.setZoom(t),this;throw new Error("maxZoom must be greater than the current minZoom")}getMaxZoom(){return this.transform.maxZoom}setMinPitch(t){if((t=null==t?0:t)<0)throw new Error("minPitch must be greater than or equal to 0");if(t>=0&&t<=this.transform.maxPitch)return this.transform.minPitch=t,this._update(),this.getPitch()<t&&this.setPitch(t),this;throw new Error("minPitch must be between 0 and the current maxPitch, inclusive")}getMinPitch(){return this.transform.minPitch}setMaxPitch(t){if((t=null==t?60:t)>85)throw new Error("maxPitch must be less than or equal to 85");if(t>=this.transform.minPitch)return this.transform.maxPitch=t,this._update(),this.getPitch()>t&&this.setPitch(t),this;throw new Error("maxPitch must be greater than the current minPitch")}getMaxPitch(){return this.transform.maxPitch}getRenderWorldCopies(){return this.transform.renderWorldCopies}setRenderWorldCopies(t){return this.transform.renderWorldCopies=t,this._update()}getCooperativeGestures(){return this._cooperativeGestures}setCooperativeGestures(t){return this._cooperativeGestures=t,this._cooperativeGestures?this._setupCooperativeGestures():this._destroyCooperativeGestures(),this}project(e){return this.transform.locationPoint(t.LngLat.convert(e),this.style&&this.terrain)}unproject(e){return this.transform.pointLocation(t.Point.convert(e),this.terrain)}isMoving(){var t;return this._moving||(null===(t=this.handlers)||void 0===t?void 0:t.isMoving())}isZooming(){var t;return this._zooming||(null===(t=this.handlers)||void 0===t?void 0:t.isZooming())}isRotating(){var t;return this._rotating||(null===(t=this.handlers)||void 0===t?void 0:t.isRotating())}_createDelegatedListener(t,e,i){if("mouseenter"===t||"mouseover"===t){let s=!1;const a=a=>{const o=this.getLayer(e)?this.queryRenderedFeatures(a.point,{layers:[e]}):[];o.length?s||(s=!0,i.call(this,new vs(t,this,a.originalEvent,{features:o}))):s=!1;};return {layer:e,listener:i,delegates:{mousemove:a,mouseout:()=>{s=!1;}}}}if("mouseleave"===t||"mouseout"===t){let s=!1;const a=a=>{(this.getLayer(e)?this.queryRenderedFeatures(a.point,{layers:[e]}):[]).length?s=!0:s&&(s=!1,i.call(this,new vs(t,this,a.originalEvent)));},o=e=>{s&&(s=!1,i.call(this,new vs(t,this,e.originalEvent)));};return {layer:e,listener:i,delegates:{mousemove:a,mouseout:o}}}{const s=t=>{const s=this.getLayer(e)?this.queryRenderedFeatures(t.point,{layers:[e]}):[];s.length&&(t.features=s,i.call(this,t),delete t.features);};return {layer:e,listener:i,delegates:{[t]:s}}}}on(t,e,i){if(void 0===i)return super.on(t,e);const s=this._createDelegatedListener(t,e,i);this._delegatedListeners=this._delegatedListeners||{},this._delegatedListeners[t]=this._delegatedListeners[t]||[],this._delegatedListeners[t].push(s);for(const t in s.delegates)this.on(t,s.delegates[t]);return this}once(t,e,i){if(void 0===i)return super.once(t,e);const s=this._createDelegatedListener(t,e,i);for(const t in s.delegates)this.once(t,s.delegates[t]);return this}off(t,e,i){return void 0===i?super.off(t,e):(this._delegatedListeners&&this._delegatedListeners[t]&&(s=>{const a=this._delegatedListeners[t];for(let t=0;t<a.length;t++){const s=a[t];if(s.layer===e&&s.listener===i){for(const t in s.delegates)this.off(t,s.delegates[t]);return a.splice(t,1),this}}})(),this)}queryRenderedFeatures(e,i){if(!this.style)return [];let s;const a=e instanceof t.Point||Array.isArray(e),o=a?e:[[0,0],[this.transform.width,this.transform.height]];if(i=i||(a?{}:e)||{},o instanceof t.Point||"number"==typeof o[0])s=[t.Point.convert(o)];else {const e=t.Point.convert(o[0]),i=t.Point.convert(o[1]);s=[e,new t.Point(i.x,e.y),i,new t.Point(e.x,i.y),e];}return this.style.queryRenderedFeatures(s,i,this.transform)}querySourceFeatures(t,e){return this.style.querySourceFeatures(t,e)}setStyle(e,i){return !1!==(i=t.extend({},{localIdeographFontFamily:this._localIdeographFontFamily,validate:this._validateStyle},i)).diff&&i.localIdeographFontFamily===this._localIdeographFontFamily&&this.style&&e?(this._diffStyle(e,i),this):(this._localIdeographFontFamily=i.localIdeographFontFamily,this._updateStyle(e,i))}setTransformRequest(t){return this._requestManager.setTransformRequest(t),this}_getUIString(t){const e=this._locale[t];if(null==e)throw new Error(`Missing UI string '${t}'`);return e}_updateStyle(t,e){if(e.transformStyle&&this.style&&!this.style._loaded)return void this.style.once("style.load",(()=>this._updateStyle(t,e)));const i=this.style&&e.transformStyle?this.style.serialize():void 0;return this.style&&(this.style.setEventedParent(null),this.style._remove(!t)),t?(this.style=new ae(this,e||{}),this.style.setEventedParent(this,{style:this.style}),"string"==typeof t?this.style.loadURL(t,e,i):this.style.loadJSON(t,e,i),this):(delete this.style,this)}_lazyInitEmptyStyle(){this.style||(this.style=new ae(this,{}),this.style.setEventedParent(this,{style:this.style}),this.style.loadEmpty());}_diffStyle(e,i){if("string"==typeof e){const s=this._requestManager.transformRequest(e,h.Style);t.getJSON(s,((e,s)=>{e?this.fire(new t.ErrorEvent(e)):s&&this._updateDiff(s,i);}));}else "object"==typeof e&&this._updateDiff(e,i);}_updateDiff(e,i){try{this.style.setState(e,i)&&this._update(!0);}catch(s){t.warnOnce(`Unable to perform style diff: ${s.message||s.error||s}.  Rebuilding the style from scratch.`),this._updateStyle(e,i);}}getStyle(){if(this.style)return this.style.serialize()}isStyleLoaded(){return this.style?this.style.loaded():t.warnOnce("There is no style added to the map.")}addSource(t,e){return this._lazyInitEmptyStyle(),this.style.addSource(t,e),this._update(!0)}isSourceLoaded(e){const i=this.style&&this.style.sourceCaches[e];if(void 0!==i)return i.loaded();this.fire(new t.ErrorEvent(new Error(`There is no source with ID '${e}'`)));}setTerrain(e){if(this.style._checkLoaded(),this._terrainDataCallback&&this.style.off("data",this._terrainDataCallback),e){const i=this.style.sourceCaches[e.source];if(!i)throw new Error(`cannot load terrain, because there exists no source with ID: ${e.source}`);for(const i in this.style._layers){const s=this.style._layers[i];"hillshade"===s.type&&s.source===e.source&&t.warnOnce("You are using the same source for a hillshade layer and for 3D terrain. Please consider using two separate sources to improve rendering quality.");}this.terrain=new _a(this.painter,i,e),this.painter.renderToTexture=new fa(this.painter,this.terrain),this.transform._minEleveationForCurrentTile=this.terrain.getMinTileElevationForLngLatZoom(this.transform.center,this.transform.tileZoom),this.transform.elevation=this.terrain.getElevationForLngLatZoom(this.transform.center,this.transform.tileZoom),this._terrainDataCallback=t=>{"style"===t.dataType?this.terrain.sourceCache.freeRtt():"source"===t.dataType&&t.tile&&(t.sourceId!==e.source||this._elevationFreeze||(this.transform._minEleveationForCurrentTile=this.terrain.getMinTileElevationForLngLatZoom(this.transform.center,this.transform.tileZoom),this.transform.elevation=this.terrain.getElevationForLngLatZoom(this.transform.center,this.transform.tileZoom)),this.terrain.sourceCache.freeRtt(t.tile.tileID));},this.style.on("data",this._terrainDataCallback);}else this.terrain&&this.terrain.sourceCache.destruct(),this.terrain=null,this.painter.renderToTexture&&this.painter.renderToTexture.destruct(),this.painter.renderToTexture=null,this.transform._minEleveationForCurrentTile=0,this.transform.elevation=0;return this.fire(new t.Event("terrain",{terrain:e})),this}getTerrain(){var t,e;return null!==(e=null===(t=this.terrain)||void 0===t?void 0:t.options)&&void 0!==e?e:null}areTilesLoaded(){const t=this.style&&this.style.sourceCaches;for(const e in t){const i=t[e]._tiles;for(const t in i){const e=i[t];if("loaded"!==e.state&&"errored"!==e.state)return !1}}return !0}addSourceType(t,e,i){return this._lazyInitEmptyStyle(),this.style.addSourceType(t,e,i)}removeSource(t){return this.style.removeSource(t),this._update(!0)}getSource(t){return this.style.getSource(t)}addImage(e,i,s={}){const{pixelRatio:a=1,sdf:o=!1,stretchX:r,stretchY:n,content:l}=s;if(this._lazyInitEmptyStyle(),!(i instanceof HTMLImageElement||t.isImageBitmap(i))){if(void 0===i.width||void 0===i.height)return this.fire(new t.ErrorEvent(new Error("Invalid arguments to map.addImage(). The second argument must be an `HTMLImageElement`, `ImageData`, `ImageBitmap`, or object with `width`, `height`, and `data` properties with the same format as `ImageData`")));{const{width:s,height:c,data:h}=i,u=i;return this.style.addImage(e,{data:new t.RGBAImage({width:s,height:c},new Uint8Array(h)),pixelRatio:a,stretchX:r,stretchY:n,content:l,sdf:o,version:0,userImage:u}),u.onAdd&&u.onAdd(this,e),this}}{const{width:s,height:c,data:h}=t.browser.getImageData(i);this.style.addImage(e,{data:new t.RGBAImage({width:s,height:c},h),pixelRatio:a,stretchX:r,stretchY:n,content:l,sdf:o,version:0});}}updateImage(e,i){const s=this.style.getImage(e);if(!s)return this.fire(new t.ErrorEvent(new Error("The map has no image with that id. If you are adding a new image use `map.addImage(...)` instead.")));const a=i instanceof HTMLImageElement||t.isImageBitmap(i)?t.browser.getImageData(i):i,{width:o,height:r,data:n}=a;if(void 0===o||void 0===r)return this.fire(new t.ErrorEvent(new Error("Invalid arguments to map.updateImage(). The second argument must be an `HTMLImageElement`, `ImageData`, `ImageBitmap`, or object with `width`, `height`, and `data` properties with the same format as `ImageData`")));if(o!==s.data.width||r!==s.data.height)return this.fire(new t.ErrorEvent(new Error("The width and height of the updated image must be that same as the previous version of the image")));const l=!(i instanceof HTMLImageElement||t.isImageBitmap(i));return s.data.replace(n,l),this.style.updateImage(e,s),this}getImage(t){return this.style.getImage(t)}hasImage(e){return e?!!this.style.getImage(e):(this.fire(new t.ErrorEvent(new Error("Missing required image id"))),!1)}removeImage(t){this.style.removeImage(t);}loadImage(t,e){c.getImage(this._requestManager.transformRequest(t,h.Image),e);}listImages(){return this.style.listImages()}addLayer(t,e){return this._lazyInitEmptyStyle(),this.style.addLayer(t,e),this._update(!0)}moveLayer(t,e){return this.style.moveLayer(t,e),this._update(!0)}removeLayer(t){return this.style.removeLayer(t),this._update(!0)}getLayer(t){return this.style.getLayer(t)}setLayerZoomRange(t,e,i){return this.style.setLayerZoomRange(t,e,i),this._update(!0)}setFilter(t,e,i={}){return this.style.setFilter(t,e,i),this._update(!0)}getFilter(t){return this.style.getFilter(t)}setPaintProperty(t,e,i,s={}){return this.style.setPaintProperty(t,e,i,s),this._update(!0)}getPaintProperty(t,e){return this.style.getPaintProperty(t,e)}setLayoutProperty(t,e,i,s={}){return this.style.setLayoutProperty(t,e,i,s),this._update(!0)}getLayoutProperty(t,e){return this.style.getLayoutProperty(t,e)}setGlyphs(t,e={}){return this._lazyInitEmptyStyle(),this.style.setGlyphs(t,e),this._update(!0)}getGlyphs(){return this.style.getGlyphsUrl()}addSprite(t,e,i={}){return this._lazyInitEmptyStyle(),this.style.addSprite(t,e,i,(t=>{t||this._update(!0);})),this}removeSprite(t){return this._lazyInitEmptyStyle(),this.style.removeSprite(t),this._update(!0)}getSprite(){return this.style.getSprite()}setSprite(t,e={}){return this._lazyInitEmptyStyle(),this.style.setSprite(t,e,(t=>{t||this._update(!0);})),this}setLight(t,e={}){return this._lazyInitEmptyStyle(),this.style.setLight(t,e),this._update(!0)}getLight(){return this.style.getLight()}setFeatureState(t,e){return this.style.setFeatureState(t,e),this._update()}removeFeatureState(t,e){return this.style.removeFeatureState(t,e),this._update()}getFeatureState(t){return this.style.getFeatureState(t)}getContainer(){return this._container}getCanvasContainer(){return this._canvasContainer}getCanvas(){return this._canvas}_containerDimensions(){let t=0,e=0;return this._container&&(t=this._container.clientWidth||400,e=this._container.clientHeight||300),[t,e]}_setupContainer(){const t=this._container;t.classList.add("maplibregl-map");const e=this._canvasContainer=i.create("div","maplibregl-canvas-container",t);this._interactive&&e.classList.add("maplibregl-interactive"),this._canvas=i.create("canvas","maplibregl-canvas",e),this._canvas.addEventListener("webglcontextlost",this._contextLost,!1),this._canvas.addEventListener("webglcontextrestored",this._contextRestored,!1),this._canvas.setAttribute("tabindex","0"),this._canvas.setAttribute("aria-label","Map"),this._canvas.setAttribute("role","region");const s=this._containerDimensions(),a=this._getClampedPixelRatio(s[0],s[1]);this._resizeCanvas(s[0],s[1],a);const o=this._controlContainer=i.create("div","maplibregl-control-container",t),r=this._controlPositions={};["top-left","top-right","bottom-left","bottom-right"].forEach((t=>{r[t]=i.create("div",`maplibregl-ctrl-${t} `,o);})),this._container.addEventListener("scroll",this._onMapScroll,!1);}_setupCooperativeGestures(){this._cooperativeGesturesScreen=i.create("div","maplibregl-cooperative-gesture-screen",this._container);let t="boolean"!=typeof this._cooperativeGestures&&this._cooperativeGestures.windowsHelpText?this._cooperativeGestures.windowsHelpText:"Use Ctrl + scroll to zoom the map";0===navigator.platform.indexOf("Mac")&&(t="boolean"!=typeof this._cooperativeGestures&&this._cooperativeGestures.macHelpText?this._cooperativeGestures.macHelpText:"Use ⌘ + scroll to zoom the map"),this._cooperativeGesturesScreen.innerHTML=`\n            <div class="maplibregl-desktop-message">${t}</div>\n            <div class="maplibregl-mobile-message">${"boolean"!=typeof this._cooperativeGestures&&this._cooperativeGestures.mobileHelpText?this._cooperativeGestures.mobileHelpText:"Use two fingers to move the map"}</div>\n        `,this._cooperativeGesturesScreen.setAttribute("aria-hidden","true"),this._canvasContainer.addEventListener("wheel",this._cooperativeGesturesOnWheel,!1),this._canvasContainer.classList.add("maplibregl-cooperative-gestures");}_destroyCooperativeGestures(){i.remove(this._cooperativeGesturesScreen),this._canvasContainer.removeEventListener("wheel",this._cooperativeGesturesOnWheel,!1),this._canvasContainer.classList.remove("maplibregl-cooperative-gestures");}_resizeCanvas(t,e,i){this._canvas.width=Math.floor(i*t),this._canvas.height=Math.floor(i*e),this._canvas.style.width=`${t}px`,this._canvas.style.height=`${e}px`;}_setupPainter(){const t={alpha:!0,stencil:!0,depth:!0,failIfMajorPerformanceCaveat:this._failIfMajorPerformanceCaveat,preserveDrawingBuffer:this._preserveDrawingBuffer,antialias:this._antialias||!1};let e=null;this._canvas.addEventListener("webglcontextcreationerror",(i=>{e={requestedAttributes:t},i&&(e.statusMessage=i.statusMessage,e.type=i.type);}),{once:!0});const i=this._canvas.getContext("webgl2",t)||this._canvas.getContext("webgl",t);if(!i){const t="Failed to initialize WebGL";throw e?(e.message=t,new Error(JSON.stringify(e))):new Error(t)}this.painter=new ss(i,this.transform),s.testSupport(i);}_onCooperativeGesture(t,e,i){return !e&&i<2&&(this._cooperativeGesturesScreen.classList.add("maplibregl-show"),setTimeout((()=>{this._cooperativeGesturesScreen.classList.remove("maplibregl-show");}),100)),!1}loaded(){return !this._styleDirty&&!this._sourcesDirty&&!!this.style&&this.style.loaded()}_update(t){return this.style&&this.style._loaded?(this._styleDirty=this._styleDirty||t,this._sourcesDirty=!0,this.triggerRepaint(),this):this}_requestRenderFrame(t){return this._update(),this._renderTaskQueue.add(t)}_cancelRenderFrame(t){this._renderTaskQueue.remove(t);}_render(e){const i=this._idleTriggered?this._fadeDuration:0;if(this.painter.context.setDirty(),this.painter.setBaseState(),this._renderTaskQueue.run(e),this._removed)return;let s=!1;if(this.style&&this._styleDirty){this._styleDirty=!1;const e=this.transform.zoom,a=t.browser.now();this.style.zoomHistory.update(e,a);const o=new t.EvaluationParameters(e,{now:a,fadeDuration:i,zoomHistory:this.style.zoomHistory,transition:this.style.getTransition()}),r=o.crossFadingFactor();1===r&&r===this._crossFadingFactor||(s=!0,this._crossFadingFactor=r),this.style.update(o);}this.style&&this._sourcesDirty&&(this._sourcesDirty=!1,this.style._updateSources(this.transform)),this.terrain?(this.terrain.sourceCache.update(this.transform,this.terrain),this.transform._minEleveationForCurrentTile=this.terrain.getMinTileElevationForLngLatZoom(this.transform.center,this.transform.tileZoom),this._elevationFreeze||(this.transform.elevation=this.terrain.getElevationForLngLatZoom(this.transform.center,this.transform.tileZoom))):(this.transform._minEleveationForCurrentTile=0,this.transform.elevation=0),this._placementDirty=this.style&&this.style._updatePlacement(this.painter.transform,this.showCollisionBoxes,i,this._crossSourceCollisions),this.painter.render(this.style,{showTileBoundaries:this.showTileBoundaries,showOverdrawInspector:this._showOverdrawInspector,rotating:this.isRotating(),zooming:this.isZooming(),moving:this.isMoving(),fadeDuration:i,showPadding:this.showPadding}),this.fire(new t.Event("render")),this.loaded()&&!this._loaded&&(this._loaded=!0,t.PerformanceUtils.mark(t.PerformanceMarkers.load),this.fire(new t.Event("load"))),this.style&&(this.style.hasTransitions()||s)&&(this._styleDirty=!0),this.style&&!this._placementDirty&&this.style._releaseSymbolFadeTiles();const a=this._sourcesDirty||this._styleDirty||this._placementDirty;return a||this._repaint?this.triggerRepaint():!this.isMoving()&&this.loaded()&&this.fire(new t.Event("idle")),!this._loaded||this._fullyLoaded||a||(this._fullyLoaded=!0,t.PerformanceUtils.mark(t.PerformanceMarkers.fullLoad)),this}redraw(){return this.style&&(this._frame&&(this._frame.cancel(),this._frame=null),this._render(0)),this}remove(){var e;this._hash&&this._hash.remove();for(const t of this._controls)t.onRemove(this);this._controls=[],this._frame&&(this._frame.cancel(),this._frame=null),this._renderTaskQueue.clear(),this.painter.destroy(),this.handlers.destroy(),delete this.handlers,this.setStyle(null),"undefined"!=typeof window&&removeEventListener("online",this._onWindowOnline,!1),c.removeThrottleControl(this._imageQueueHandle),null===(e=this._resizeObserver)||void 0===e||e.disconnect();const s=this.painter.context.gl.getExtension("WEBGL_lose_context");s&&s.loseContext(),this._canvas.removeEventListener("webglcontextrestored",this._contextRestored,!1),this._canvas.removeEventListener("webglcontextlost",this._contextLost,!1),i.remove(this._canvasContainer),i.remove(this._controlContainer),this._cooperativeGestures&&this._destroyCooperativeGestures(),this._container.classList.remove("maplibregl-map"),t.PerformanceUtils.clearMetrics(),this._removed=!0,this.fire(new t.Event("remove"));}triggerRepaint(){this.style&&!this._frame&&(this._frame=t.browser.frame((e=>{t.PerformanceUtils.frame(e),this._frame=null,this._render(e);})));}get showTileBoundaries(){return !!this._showTileBoundaries}set showTileBoundaries(t){this._showTileBoundaries!==t&&(this._showTileBoundaries=t,this._update());}get showPadding(){return !!this._showPadding}set showPadding(t){this._showPadding!==t&&(this._showPadding=t,this._update());}get showCollisionBoxes(){return !!this._showCollisionBoxes}set showCollisionBoxes(t){this._showCollisionBoxes!==t&&(this._showCollisionBoxes=t,t?this.style._generateCollisionBoxes():this._update());}get showOverdrawInspector(){return !!this._showOverdrawInspector}set showOverdrawInspector(t){this._showOverdrawInspector!==t&&(this._showOverdrawInspector=t,this._update());}get repaint(){return !!this._repaint}set repaint(t){this._repaint!==t&&(this._repaint=t,this.triggerRepaint());}get vertices(){return !!this._vertices}set vertices(t){this._vertices=t,this._update();}get version(){return ga}getCameraTargetElevation(){return this.transform.elevation}},Ua.NavigationControl=class{constructor(e){this._updateZoomButtons=()=>{const t=this._map.getZoom(),e=t===this._map.getMaxZoom(),i=t===this._map.getMinZoom();this._zoomInButton.disabled=e,this._zoomOutButton.disabled=i,this._zoomInButton.setAttribute("aria-disabled",e.toString()),this._zoomOutButton.setAttribute("aria-disabled",i.toString());},this._rotateCompassArrow=()=>{const t=this.options.visualizePitch?`scale(${1/Math.pow(Math.cos(this._map.transform.pitch*(Math.PI/180)),.5)}) rotateX(${this._map.transform.pitch}deg) rotateZ(${this._map.transform.angle*(180/Math.PI)}deg)`:`rotate(${this._map.transform.angle*(180/Math.PI)}deg)`;this._compassIcon.style.transform=t;},this._setButtonTitle=(t,e)=>{const i=this._map._getUIString(`NavigationControl.${e}`);t.title=i,t.setAttribute("aria-label",i);},this.options=t.extend({},ya,e),this._container=i.create("div","maplibregl-ctrl maplibregl-ctrl-group"),this._container.addEventListener("contextmenu",(t=>t.preventDefault())),this.options.showZoom&&(this._zoomInButton=this._createButton("maplibregl-ctrl-zoom-in",(t=>this._map.zoomIn({},{originalEvent:t}))),i.create("span","maplibregl-ctrl-icon",this._zoomInButton).setAttribute("aria-hidden","true"),this._zoomOutButton=this._createButton("maplibregl-ctrl-zoom-out",(t=>this._map.zoomOut({},{originalEvent:t}))),i.create("span","maplibregl-ctrl-icon",this._zoomOutButton).setAttribute("aria-hidden","true")),this.options.showCompass&&(this._compass=this._createButton("maplibregl-ctrl-compass",(t=>{this.options.visualizePitch?this._map.resetNorthPitch({},{originalEvent:t}):this._map.resetNorth({},{originalEvent:t});})),this._compassIcon=i.create("span","maplibregl-ctrl-icon",this._compass),this._compassIcon.setAttribute("aria-hidden","true"));}onAdd(t){return this._map=t,this.options.showZoom&&(this._setButtonTitle(this._zoomInButton,"ZoomIn"),this._setButtonTitle(this._zoomOutButton,"ZoomOut"),this._map.on("zoom",this._updateZoomButtons),this._updateZoomButtons()),this.options.showCompass&&(this._setButtonTitle(this._compass,"ResetBearing"),this.options.visualizePitch&&this._map.on("pitch",this._rotateCompassArrow),this._map.on("rotate",this._rotateCompassArrow),this._rotateCompassArrow(),this._handler=new ba(this._map,this._compass,this.options.visualizePitch)),this._container}onRemove(){i.remove(this._container),this.options.showZoom&&this._map.off("zoom",this._updateZoomButtons),this.options.showCompass&&(this.options.visualizePitch&&this._map.off("pitch",this._rotateCompassArrow),this._map.off("rotate",this._rotateCompassArrow),this._handler.off(),delete this._handler),delete this._map;}_createButton(t,e){const s=i.create("button",t,this._container);return s.type="button",s.addEventListener("click",e),s}},Ua.GeolocateControl=class extends t.Evented{constructor(e){super(),this._onSuccess=e=>{if(this._map){if(this._isOutOfMapMaxBounds(e))return this._setErrorState(),this.fire(new t.Event("outofmaxbounds",e)),this._updateMarker(),void this._finish();if(this.options.trackUserLocation)switch(this._lastKnownPosition=e,this._watchState){case"WAITING_ACTIVE":case"ACTIVE_LOCK":case"ACTIVE_ERROR":this._watchState="ACTIVE_LOCK",this._geolocateButton.classList.remove("maplibregl-ctrl-geolocate-waiting"),this._geolocateButton.classList.remove("maplibregl-ctrl-geolocate-active-error"),this._geolocateButton.classList.add("maplibregl-ctrl-geolocate-active");break;case"BACKGROUND":case"BACKGROUND_ERROR":this._watchState="BACKGROUND",this._geolocateButton.classList.remove("maplibregl-ctrl-geolocate-waiting"),this._geolocateButton.classList.remove("maplibregl-ctrl-geolocate-background-error"),this._geolocateButton.classList.add("maplibregl-ctrl-geolocate-background");break;default:throw new Error(`Unexpected watchState ${this._watchState}`)}this.options.showUserLocation&&"OFF"!==this._watchState&&this._updateMarker(e),this.options.trackUserLocation&&"ACTIVE_LOCK"!==this._watchState||this._updateCamera(e),this.options.showUserLocation&&this._dotElement.classList.remove("maplibregl-user-location-dot-stale"),this.fire(new t.Event("geolocate",e)),this._finish();}},this._updateCamera=e=>{const i=new t.LngLat(e.coords.longitude,e.coords.latitude),s=e.coords.accuracy,a=this._map.getBearing(),o=t.extend({bearing:a},this.options.fitBoundsOptions),r=L.fromLngLat(i,s);this._map.fitBounds(r,o,{geolocateSource:!0});},this._updateMarker=e=>{if(e){const i=new t.LngLat(e.coords.longitude,e.coords.latitude);this._accuracyCircleMarker.setLngLat(i).addTo(this._map),this._userLocationDotMarker.setLngLat(i).addTo(this._map),this._accuracy=e.coords.accuracy,this.options.showUserLocation&&this.options.showAccuracyCircle&&this._updateCircleRadius();}else this._userLocationDotMarker.remove(),this._accuracyCircleMarker.remove();},this._onZoom=()=>{this.options.showUserLocation&&this.options.showAccuracyCircle&&this._updateCircleRadius();},this._onError=e=>{if(this._map){if(this.options.trackUserLocation)if(1===e.code){this._watchState="OFF",this._geolocateButton.classList.remove("maplibregl-ctrl-geolocate-waiting"),this._geolocateButton.classList.remove("maplibregl-ctrl-geolocate-active"),this._geolocateButton.classList.remove("maplibregl-ctrl-geolocate-active-error"),this._geolocateButton.classList.remove("maplibregl-ctrl-geolocate-background"),this._geolocateButton.classList.remove("maplibregl-ctrl-geolocate-background-error"),this._geolocateButton.disabled=!0;const t=this._map._getUIString("GeolocateControl.LocationNotAvailable");this._geolocateButton.title=t,this._geolocateButton.setAttribute("aria-label",t),void 0!==this._geolocationWatchID&&this._clearWatch();}else {if(3===e.code&&Da)return;this._setErrorState();}"OFF"!==this._watchState&&this.options.showUserLocation&&this._dotElement.classList.add("maplibregl-user-location-dot-stale"),this.fire(new t.Event("error",e)),this._finish();}},this._finish=()=>{this._timeoutId&&clearTimeout(this._timeoutId),this._timeoutId=void 0;},this._setupUI=e=>{if(this._map){if(this._container.addEventListener("contextmenu",(t=>t.preventDefault())),this._geolocateButton=i.create("button","maplibregl-ctrl-geolocate",this._container),i.create("span","maplibregl-ctrl-icon",this._geolocateButton).setAttribute("aria-hidden","true"),this._geolocateButton.type="button",!1===e){t.warnOnce("Geolocation support is not available so the GeolocateControl will be disabled.");const e=this._map._getUIString("GeolocateControl.LocationNotAvailable");this._geolocateButton.disabled=!0,this._geolocateButton.title=e,this._geolocateButton.setAttribute("aria-label",e);}else {const t=this._map._getUIString("GeolocateControl.FindMyLocation");this._geolocateButton.title=t,this._geolocateButton.setAttribute("aria-label",t);}this.options.trackUserLocation&&(this._geolocateButton.setAttribute("aria-pressed","false"),this._watchState="OFF"),this.options.showUserLocation&&(this._dotElement=i.create("div","maplibregl-user-location-dot"),this._userLocationDotMarker=new Sa({element:this._dotElement}),this._circleElement=i.create("div","maplibregl-user-location-accuracy-circle"),this._accuracyCircleMarker=new Sa({element:this._circleElement,pitchAlignment:"map"}),this.options.trackUserLocation&&(this._watchState="OFF"),this._map.on("zoom",this._onZoom)),this._geolocateButton.addEventListener("click",this.trigger.bind(this)),this._setup=!0,this.options.trackUserLocation&&this._map.on("movestart",(e=>{e.geolocateSource||"ACTIVE_LOCK"!==this._watchState||e.originalEvent&&"resize"===e.originalEvent.type||(this._watchState="BACKGROUND",this._geolocateButton.classList.add("maplibregl-ctrl-geolocate-background"),this._geolocateButton.classList.remove("maplibregl-ctrl-geolocate-active"),this.fire(new t.Event("trackuserlocationend")));}));}},this.options=t.extend({},Ca,e);}onAdd(t){return this._map=t,this._container=i.create("div","maplibregl-ctrl maplibregl-ctrl-group"),function(t,e=!1){void 0===wa||e?void 0!==window.navigator.permissions?window.navigator.permissions.query({name:"geolocation"}).then((e=>{wa="denied"!==e.state,t(wa);})).catch((()=>{wa=!!window.navigator.geolocation,t(wa);})):(wa=!!window.navigator.geolocation,t(wa)):t(wa);}(this._setupUI),this._container}onRemove(){void 0!==this._geolocationWatchID&&(window.navigator.geolocation.clearWatch(this._geolocationWatchID),this._geolocationWatchID=void 0),this.options.showUserLocation&&this._userLocationDotMarker&&this._userLocationDotMarker.remove(),this.options.showAccuracyCircle&&this._accuracyCircleMarker&&this._accuracyCircleMarker.remove(),i.remove(this._container),this._map.off("zoom",this._onZoom),this._map=void 0,Pa=0,Da=!1;}_isOutOfMapMaxBounds(t){const e=this._map.getMaxBounds(),i=t.coords;return e&&(i.longitude<e.getWest()||i.longitude>e.getEast()||i.latitude<e.getSouth()||i.latitude>e.getNorth())}_setErrorState(){switch(this._watchState){case"WAITING_ACTIVE":this._watchState="ACTIVE_ERROR",this._geolocateButton.classList.remove("maplibregl-ctrl-geolocate-active"),this._geolocateButton.classList.add("maplibregl-ctrl-geolocate-active-error");break;case"ACTIVE_LOCK":this._watchState="ACTIVE_ERROR",this._geolocateButton.classList.remove("maplibregl-ctrl-geolocate-active"),this._geolocateButton.classList.add("maplibregl-ctrl-geolocate-active-error"),this._geolocateButton.classList.add("maplibregl-ctrl-geolocate-waiting");break;case"BACKGROUND":this._watchState="BACKGROUND_ERROR",this._geolocateButton.classList.remove("maplibregl-ctrl-geolocate-background"),this._geolocateButton.classList.add("maplibregl-ctrl-geolocate-background-error"),this._geolocateButton.classList.add("maplibregl-ctrl-geolocate-waiting");break;case"ACTIVE_ERROR":break;default:throw new Error(`Unexpected watchState ${this._watchState}`)}}_updateCircleRadius(){const t=this._map.getBounds(),e=t.getSouthEast(),i=t.getNorthEast(),s=e.distanceTo(i),a=Math.ceil(this._accuracy/(s/this._map._container.clientHeight)*2);this._circleElement.style.width=`${a}px`,this._circleElement.style.height=`${a}px`;}trigger(){if(!this._setup)return t.warnOnce("Geolocate control triggered before added to a map"),!1;if(this.options.trackUserLocation){switch(this._watchState){case"OFF":this._watchState="WAITING_ACTIVE",this.fire(new t.Event("trackuserlocationstart"));break;case"WAITING_ACTIVE":case"ACTIVE_LOCK":case"ACTIVE_ERROR":case"BACKGROUND_ERROR":Pa--,Da=!1,this._watchState="OFF",this._geolocateButton.classList.remove("maplibregl-ctrl-geolocate-waiting"),this._geolocateButton.classList.remove("maplibregl-ctrl-geolocate-active"),this._geolocateButton.classList.remove("maplibregl-ctrl-geolocate-active-error"),this._geolocateButton.classList.remove("maplibregl-ctrl-geolocate-background"),this._geolocateButton.classList.remove("maplibregl-ctrl-geolocate-background-error"),this.fire(new t.Event("trackuserlocationend"));break;case"BACKGROUND":this._watchState="ACTIVE_LOCK",this._geolocateButton.classList.remove("maplibregl-ctrl-geolocate-background"),this._lastKnownPosition&&this._updateCamera(this._lastKnownPosition),this.fire(new t.Event("trackuserlocationstart"));break;default:throw new Error(`Unexpected watchState ${this._watchState}`)}switch(this._watchState){case"WAITING_ACTIVE":this._geolocateButton.classList.add("maplibregl-ctrl-geolocate-waiting"),this._geolocateButton.classList.add("maplibregl-ctrl-geolocate-active");break;case"ACTIVE_LOCK":this._geolocateButton.classList.add("maplibregl-ctrl-geolocate-active");break;case"OFF":break;default:throw new Error(`Unexpected watchState ${this._watchState}`)}if("OFF"===this._watchState&&void 0!==this._geolocationWatchID)this._clearWatch();else if(void 0===this._geolocationWatchID){let t;this._geolocateButton.classList.add("maplibregl-ctrl-geolocate-waiting"),this._geolocateButton.setAttribute("aria-pressed","true"),Pa++,Pa>1?(t={maximumAge:6e5,timeout:0},Da=!0):(t=this.options.positionOptions,Da=!1),this._geolocationWatchID=window.navigator.geolocation.watchPosition(this._onSuccess,this._onError,t);}}else window.navigator.geolocation.getCurrentPosition(this._onSuccess,this._onError,this.options.positionOptions),this._timeoutId=setTimeout(this._finish,1e4);return !0}_clearWatch(){window.navigator.geolocation.clearWatch(this._geolocationWatchID),this._geolocationWatchID=void 0,this._geolocateButton.classList.remove("maplibregl-ctrl-geolocate-waiting"),this._geolocateButton.setAttribute("aria-pressed","false"),this.options.showUserLocation&&this._updateMarker(null);}},Ua.AttributionControl=na,Ua.LogoControl=la,Ua.ScaleControl=class{constructor(e){this._onMove=()=>{za(this._map,this._container,this.options);},this.setUnit=t=>{this.options.unit=t,za(this._map,this._container,this.options);},this.options=t.extend({},Ma,e);}getDefaultPosition(){return "bottom-left"}onAdd(t){return this._map=t,this._container=i.create("div","maplibregl-ctrl maplibregl-ctrl-scale",t.getContainer()),this._map.on("move",this._onMove),this._onMove(),this._container}onRemove(){i.remove(this._container),this._map.off("move",this._onMove),this._map=void 0;}},Ua.FullscreenControl=class extends t.Evented{constructor(e={}){super(),this._onFullscreenChange=()=>{(window.document.fullscreenElement||window.document.mozFullScreenElement||window.document.webkitFullscreenElement||window.document.msFullscreenElement)===this._container!==this._fullscreen&&this._handleFullscreenChange();},this._onClickFullscreen=()=>{this._isFullscreen()?this._exitFullscreen():this._requestFullscreen();},this._fullscreen=!1,e&&e.container&&(e.container instanceof HTMLElement?this._container=e.container:t.warnOnce("Full screen control 'container' must be a DOM element.")),"onfullscreenchange"in document?this._fullscreenchange="fullscreenchange":"onmozfullscreenchange"in document?this._fullscreenchange="mozfullscreenchange":"onwebkitfullscreenchange"in document?this._fullscreenchange="webkitfullscreenchange":"onmsfullscreenchange"in document&&(this._fullscreenchange="MSFullscreenChange");}onAdd(t){return this._map=t,this._container||(this._container=this._map.getContainer()),this._controlContainer=i.create("div","maplibregl-ctrl maplibregl-ctrl-group"),this._setupUI(),this._controlContainer}onRemove(){i.remove(this._controlContainer),this._map=null,window.document.removeEventListener(this._fullscreenchange,this._onFullscreenChange);}_setupUI(){const t=this._fullscreenButton=i.create("button","maplibregl-ctrl-fullscreen",this._controlContainer);i.create("span","maplibregl-ctrl-icon",t).setAttribute("aria-hidden","true"),t.type="button",this._updateTitle(),this._fullscreenButton.addEventListener("click",this._onClickFullscreen),window.document.addEventListener(this._fullscreenchange,this._onFullscreenChange);}_updateTitle(){const t=this._getTitle();this._fullscreenButton.setAttribute("aria-label",t),this._fullscreenButton.title=t;}_getTitle(){return this._map._getUIString(this._isFullscreen()?"FullscreenControl.Exit":"FullscreenControl.Enter")}_isFullscreen(){return this._fullscreen}_handleFullscreenChange(){this._fullscreen=!this._fullscreen,this._fullscreenButton.classList.toggle("maplibregl-ctrl-shrink"),this._fullscreenButton.classList.toggle("maplibregl-ctrl-fullscreen"),this._updateTitle(),this._fullscreen?(this.fire(new t.Event("fullscreenstart")),this._map._cooperativeGestures&&(this._prevCooperativeGestures=this._map._cooperativeGestures,this._map.setCooperativeGestures())):(this.fire(new t.Event("fullscreenend")),this._prevCooperativeGestures&&(this._map.setCooperativeGestures(this._prevCooperativeGestures),delete this._prevCooperativeGestures));}_exitFullscreen(){window.document.exitFullscreen?window.document.exitFullscreen():window.document.mozCancelFullScreen?window.document.mozCancelFullScreen():window.document.msExitFullscreen?window.document.msExitFullscreen():window.document.webkitCancelFullScreen?window.document.webkitCancelFullScreen():this._togglePseudoFullScreen();}_requestFullscreen(){this._container.requestFullscreen?this._container.requestFullscreen():this._container.mozRequestFullScreen?this._container.mozRequestFullScreen():this._container.msRequestFullscreen?this._container.msRequestFullscreen():this._container.webkitRequestFullscreen?this._container.webkitRequestFullscreen():this._togglePseudoFullScreen();}_togglePseudoFullScreen(){this._container.classList.toggle("maplibregl-pseudo-fullscreen"),this._handleFullscreenChange(),this._map.resize();}},Ua.TerrainControl=class{constructor(t){this._toggleTerrain=()=>{this._map.getTerrain()?this._map.setTerrain(null):this._map.setTerrain(this.options),this._updateTerrainIcon();},this._updateTerrainIcon=()=>{this._terrainButton.classList.remove("maplibregl-ctrl-terrain"),this._terrainButton.classList.remove("maplibregl-ctrl-terrain-enabled"),this._map.terrain?(this._terrainButton.classList.add("maplibregl-ctrl-terrain-enabled"),this._terrainButton.title=this._map._getUIString("TerrainControl.disableTerrain")):(this._terrainButton.classList.add("maplibregl-ctrl-terrain"),this._terrainButton.title=this._map._getUIString("TerrainControl.enableTerrain"));},this.options=t;}onAdd(t){return this._map=t,this._container=i.create("div","maplibregl-ctrl maplibregl-ctrl-group"),this._terrainButton=i.create("button","maplibregl-ctrl-terrain",this._container),i.create("span","maplibregl-ctrl-icon",this._terrainButton).setAttribute("aria-hidden","true"),this._terrainButton.type="button",this._terrainButton.addEventListener("click",this._toggleTerrain),this._updateTerrainIcon(),this._map.on("terrain",this._updateTerrainIcon),this._container}onRemove(){i.remove(this._container),this._map.off("terrain",this._updateTerrainIcon),this._map=void 0;}},Ua.Popup=class extends t.Evented{constructor(e){super(),this.remove=()=>(this._content&&i.remove(this._content),this._container&&(i.remove(this._container),delete this._container),this._map&&(this._map.off("move",this._update),this._map.off("move",this._onClose),this._map.off("click",this._onClose),this._map.off("remove",this.remove),this._map.off("mousemove",this._onMouseMove),this._map.off("mouseup",this._onMouseUp),this._map.off("drag",this._onDrag),delete this._map),this.fire(new t.Event("close")),this),this._onMouseUp=t=>{this._update(t.point);},this._onMouseMove=t=>{this._update(t.point);},this._onDrag=t=>{this._update(t.point);},this._update=t=>{if(!this._map||!this._lngLat&&!this._trackPointer||!this._content)return;if(!this._container){if(this._container=i.create("div","maplibregl-popup",this._map.getContainer()),this._tip=i.create("div","maplibregl-popup-tip",this._container),this._container.appendChild(this._content),this.options.className)for(const t of this.options.className.split(" "))this._container.classList.add(t);this._trackPointer&&this._container.classList.add("maplibregl-popup-track-pointer");}if(this.options.maxWidth&&this._container.style.maxWidth!==this.options.maxWidth&&(this._container.style.maxWidth=this.options.maxWidth),this._map.transform.renderWorldCopies&&!this._trackPointer&&(this._lngLat=Ta(this._lngLat,this._pos,this._map.transform)),this._trackPointer&&!t)return;const e=this._pos=this._trackPointer&&t?t:this._map.project(this._lngLat);let s=this.options.anchor;const a=ka(this.options.offset);if(!s){const t=this._container.offsetWidth,i=this._container.offsetHeight;let o;o=e.y+a.bottom.y<i?["top"]:e.y>this._map.transform.height-i?["bottom"]:[],e.x<t/2?o.push("left"):e.x>this._map.transform.width-t/2&&o.push("right"),s=0===o.length?"bottom":o.join("-");}const o=e.add(a[s]).round();i.setTransform(this._container,`${Ea[s]} translate(${o.x}px,${o.y}px)`),Ia(this._container,s,"popup");},this._onClose=()=>{this.remove();},this.options=t.extend(Object.create(La),e);}addTo(e){return this._map&&this.remove(),this._map=e,this.options.closeOnClick&&this._map.on("click",this._onClose),this.options.closeOnMove&&this._map.on("move",this._onClose),this._map.on("remove",this.remove),this._update(),this._focusFirstElement(),this._trackPointer?(this._map.on("mousemove",this._onMouseMove),this._map.on("mouseup",this._onMouseUp),this._container&&this._container.classList.add("maplibregl-popup-track-pointer"),this._map._canvasContainer.classList.add("maplibregl-track-pointer")):this._map.on("move",this._update),this.fire(new t.Event("open")),this}isOpen(){return !!this._map}getLngLat(){return this._lngLat}setLngLat(e){return this._lngLat=t.LngLat.convert(e),this._pos=null,this._trackPointer=!1,this._update(),this._map&&(this._map.on("move",this._update),this._map.off("mousemove",this._onMouseMove),this._container&&this._container.classList.remove("maplibregl-popup-track-pointer"),this._map._canvasContainer.classList.remove("maplibregl-track-pointer")),this}trackPointer(){return this._trackPointer=!0,this._pos=null,this._update(),this._map&&(this._map.off("move",this._update),this._map.on("mousemove",this._onMouseMove),this._map.on("drag",this._onDrag),this._container&&this._container.classList.add("maplibregl-popup-track-pointer"),this._map._canvasContainer.classList.add("maplibregl-track-pointer")),this}getElement(){return this._container}setText(t){return this.setDOMContent(document.createTextNode(t))}setHTML(t){const e=document.createDocumentFragment(),i=document.createElement("body");let s;for(i.innerHTML=t;s=i.firstChild,s;)e.appendChild(s);return this.setDOMContent(e)}getMaxWidth(){var t;return null===(t=this._container)||void 0===t?void 0:t.style.maxWidth}setMaxWidth(t){return this.options.maxWidth=t,this._update(),this}setDOMContent(t){if(this._content)for(;this._content.hasChildNodes();)this._content.firstChild&&this._content.removeChild(this._content.firstChild);else this._content=i.create("div","maplibregl-popup-content",this._container);return this._content.appendChild(t),this._createCloseButton(),this._update(),this._focusFirstElement(),this}addClassName(t){this._container&&this._container.classList.add(t);}removeClassName(t){this._container&&this._container.classList.remove(t);}setOffset(t){return this.options.offset=t,this._update(),this}toggleClassName(t){if(this._container)return this._container.classList.toggle(t)}_createCloseButton(){this.options.closeButton&&(this._closeButton=i.create("button","maplibregl-popup-close-button",this._content),this._closeButton.type="button",this._closeButton.setAttribute("aria-label","Close popup"),this._closeButton.innerHTML="&#215;",this._closeButton.addEventListener("click",this._onClose));}_focusFirstElement(){if(!this.options.focusAfterOpen||!this._container)return;const t=this._container.querySelector(Ra);t&&t.focus();}},Ua.Marker=Sa,Ua.Style=ae,Ua.LngLat=t.LngLat,Ua.LngLatBounds=L,Ua.Point=t.Point,Ua.MercatorCoordinate=t.MercatorCoordinate,Ua.Evented=t.Evented,Ua.AJAXError=t.AJAXError,Ua.config=t.config,Ua.CanvasSource=G,Ua.GeoJSONSource=U,Ua.ImageSource=N,Ua.RasterDEMTileSource=B,Ua.RasterTileSource=F,Ua.VectorTileSource=k,Ua.VideoSource=Z,Ua.setRTLTextPlugin=t.setRTLTextPlugin,Ua.getRTLTextPluginStatus=t.getRTLTextPluginStatus,Ua.prewarm=function(){at().acquire(tt);},Ua.clearPrewarmedResources=function(){const t=st;t&&(t.isPreloaded()&&1===t.numActive()?(t.release(tt),st=null):console.warn("Could not clear WebWorkers since there are active Map instances that still reference it. The pre-warmed WebWorker pool can only be cleared when all map instances have been removed with map.remove()"));},Fa.extend(Ua,{isSafari:t.isSafari,getPerformanceMetrics:t.PerformanceUtils.getPerformanceMetrics}),Ua}));

    //
    // Our custom intro provides a specialized "define()" function, called by the
    // AMD modules below, that sets up the worker blob URL and then executes the
    // main module, storing its exported value as 'maplibregl'


    var maplibregl$1 = maplibregl;

    return maplibregl$1;

    }));

    });

    var maplibre = unwrapExports(maplibreGl);

    /* src\Map.svelte generated by Svelte v3.59.2 */

    const { document: document_1 } = globals;
    const file$1 = "src\\Map.svelte";

    // (148:1) {#if loaded}
    function create_if_block$2(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[19].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[18], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 262144)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[18],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[18])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[18], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(148:1) {#if loaded}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let link;
    	let link_href_value;
    	let t;
    	let div;
    	let current;
    	let if_block = /*loaded*/ ctx[3] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			link = element("link");
    			t = space();
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(link, "rel", "stylesheet");

    			attr_dev(link, "href", link_href_value = /*css*/ ctx[1]
    			? /*css*/ ctx[1]
    			: 'https://unpkg.com/maplibre-gl@3.3.1/dist/maplibre-gl.css');

    			add_location(link, file$1, 140, 1, 3403);
    			attr_dev(div, "id", /*id*/ ctx[0]);
    			attr_dev(div, "class", "map svelte-1tna482");
    			add_location(div, file$1, 146, 0, 3538);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document_1.head, link);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			/*div_binding*/ ctx[20](div);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*css*/ 2 && link_href_value !== (link_href_value = /*css*/ ctx[1]
    			? /*css*/ ctx[1]
    			: 'https://unpkg.com/maplibre-gl@3.3.1/dist/maplibre-gl.css')) {
    				attr_dev(link, "href", link_href_value);
    			}

    			if (/*loaded*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*loaded*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*id*/ 1) {
    				attr_dev(div, "id", /*id*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(link);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			/*div_binding*/ ctx[20](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function sleep$2(ms = 1000) {
    	return new Promise(resolve => setTimeout(resolve, ms));
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Map', slots, ['default']);
    	const dispatch = createEventDispatcher();
    	let { map } = $$props;
    	let { id = "map" } = $$props;
    	let { location = { lng: 15, lat: 45, zoom: 1 } } = $$props;

    	let { style = {
    		"version": 8,
    		"sources": {},
    		"layers": [
    			{
    				"id": "background",
    				"type": "background",
    				"paint": { "background-color": "lightgrey" }
    			}
    		]
    	} } = $$props;

    	let { css = null } = $$props;
    	let { options = {} } = $$props;
    	let { minzoom = 0 } = $$props;
    	let { maxzoom = 14 } = $$props;
    	let { controls = false } = $$props;
    	let { tabbable = false } = $$props;
    	let { zoom = null } = $$props;
    	let { center = null } = $$props;
    	let { pitch = null } = $$props;
    	let { bearing = null } = $$props;
    	let { interactive = true } = $$props;
    	let { attribution = true } = $$props;
    	let container;
    	let _options = {};
    	let loaded = false;
    	setContext("map", { getMap: () => map });

    	function updateLocation() {
    		if (typeof map?.getZoom === "function") {
    			$$invalidate(5, zoom = map.getZoom());
    			$$invalidate(6, center = map.getCenter());
    			$$invalidate(7, pitch = map.getPitch());
    			$$invalidate(8, bearing = map.getBearing());
    		}
    	}

    	// Interpret location
    	if (location.bounds) {
    		_options.bounds = location.bounds;
    	} else if (location.lng && location.lat) {
    		_options.center = [+location.lng, +location.lat];

    		if (location.zoom) {
    			_options.zoom = +location.zoom;
    		}

    		if (location.pitch) {
    			_options.pitch = +location.pitch;
    		}

    		if (location.bearing) {
    			_options.bearing = +location.bearing;
    		}
    	}

    	// Disable attribution if attribution = false
    	if (!attribution) {
    		_options.attributionControl = false;
    	}

    	_options = { ..._options, ...options }; // Combine core options + custom user options

    	onMount(() => {
    		const newmap = new maplibre.Map({
    				container,
    				style,
    				minZoom: minzoom,
    				maxZoom: maxzoom,
    				interactive,
    				..._options
    			});

    		$$invalidate(4, map = newmap);

    		if (controls && !Array.isArray(controls)) {
    			map.addControl(new maplibre.NavigationControl({ showCompass: false }));
    		} else if (Array.isArray(controls) && controls != ["locate"]) {
    			map.addControl(new maplibre.NavigationControl({
    					showCompass: controls.includes("compass"),
    					visualizePitch: controls.includes("pitch")
    				}));
    		}

    		if (Array.isArray(controls) && controls.includes("locate")) {
    			map.addControl(new maplibre.GeolocateControl());
    		}

    		// Get initial zoom level
    		map.on("load", e => {
    			updateLocation();
    			$$invalidate(3, loaded = true);

    			// Prevent map from being tabbable
    			if (!tabbable && document.querySelector(`#${id} canvas`)) {
    				document.querySelector(`#${id} canvas`).tabIndex = "-1";
    			}

    			dispatch("load", { event: e });
    		});

    		// Update zoom level and center when the view changes
    		map.on("moveend", updateLocation);

    		return async () => {
    			await sleep$2(100);
    			newmap.remove();
    		};
    	});

    	// Function to switch map style if style prop changes
    	async function setStyle(style) {
    		if (map) {
    			$$invalidate(3, loaded = false);
    			map.setStyle(style);
    			map.once("idle", () => $$invalidate(3, loaded = true));
    			dispatch("style", { style });
    		}
    	}

    	$$self.$$.on_mount.push(function () {
    		if (map === undefined && !('map' in $$props || $$self.$$.bound[$$self.$$.props['map']])) {
    			console.warn("<Map> was created without expected prop 'map'");
    		}
    	});

    	const writable_props = [
    		'map',
    		'id',
    		'location',
    		'style',
    		'css',
    		'options',
    		'minzoom',
    		'maxzoom',
    		'controls',
    		'tabbable',
    		'zoom',
    		'center',
    		'pitch',
    		'bearing',
    		'interactive',
    		'attribution'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Map> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			container = $$value;
    			$$invalidate(2, container);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('map' in $$props) $$invalidate(4, map = $$props.map);
    		if ('id' in $$props) $$invalidate(0, id = $$props.id);
    		if ('location' in $$props) $$invalidate(9, location = $$props.location);
    		if ('style' in $$props) $$invalidate(10, style = $$props.style);
    		if ('css' in $$props) $$invalidate(1, css = $$props.css);
    		if ('options' in $$props) $$invalidate(11, options = $$props.options);
    		if ('minzoom' in $$props) $$invalidate(12, minzoom = $$props.minzoom);
    		if ('maxzoom' in $$props) $$invalidate(13, maxzoom = $$props.maxzoom);
    		if ('controls' in $$props) $$invalidate(14, controls = $$props.controls);
    		if ('tabbable' in $$props) $$invalidate(15, tabbable = $$props.tabbable);
    		if ('zoom' in $$props) $$invalidate(5, zoom = $$props.zoom);
    		if ('center' in $$props) $$invalidate(6, center = $$props.center);
    		if ('pitch' in $$props) $$invalidate(7, pitch = $$props.pitch);
    		if ('bearing' in $$props) $$invalidate(8, bearing = $$props.bearing);
    		if ('interactive' in $$props) $$invalidate(16, interactive = $$props.interactive);
    		if ('attribution' in $$props) $$invalidate(17, attribution = $$props.attribution);
    		if ('$$scope' in $$props) $$invalidate(18, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		setContext,
    		createEventDispatcher,
    		onMount,
    		onDestroy,
    		maplibre,
    		dispatch,
    		map,
    		id,
    		location,
    		style,
    		css,
    		options,
    		minzoom,
    		maxzoom,
    		controls,
    		tabbable,
    		zoom,
    		center,
    		pitch,
    		bearing,
    		interactive,
    		attribution,
    		container,
    		_options,
    		loaded,
    		sleep: sleep$2,
    		updateLocation,
    		setStyle
    	});

    	$$self.$inject_state = $$props => {
    		if ('map' in $$props) $$invalidate(4, map = $$props.map);
    		if ('id' in $$props) $$invalidate(0, id = $$props.id);
    		if ('location' in $$props) $$invalidate(9, location = $$props.location);
    		if ('style' in $$props) $$invalidate(10, style = $$props.style);
    		if ('css' in $$props) $$invalidate(1, css = $$props.css);
    		if ('options' in $$props) $$invalidate(11, options = $$props.options);
    		if ('minzoom' in $$props) $$invalidate(12, minzoom = $$props.minzoom);
    		if ('maxzoom' in $$props) $$invalidate(13, maxzoom = $$props.maxzoom);
    		if ('controls' in $$props) $$invalidate(14, controls = $$props.controls);
    		if ('tabbable' in $$props) $$invalidate(15, tabbable = $$props.tabbable);
    		if ('zoom' in $$props) $$invalidate(5, zoom = $$props.zoom);
    		if ('center' in $$props) $$invalidate(6, center = $$props.center);
    		if ('pitch' in $$props) $$invalidate(7, pitch = $$props.pitch);
    		if ('bearing' in $$props) $$invalidate(8, bearing = $$props.bearing);
    		if ('interactive' in $$props) $$invalidate(16, interactive = $$props.interactive);
    		if ('attribution' in $$props) $$invalidate(17, attribution = $$props.attribution);
    		if ('container' in $$props) $$invalidate(2, container = $$props.container);
    		if ('_options' in $$props) _options = $$props._options;
    		if ('loaded' in $$props) $$invalidate(3, loaded = $$props.loaded);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*style*/ 1024) {
    			setStyle(style);
    		}
    	};

    	return [
    		id,
    		css,
    		container,
    		loaded,
    		map,
    		zoom,
    		center,
    		pitch,
    		bearing,
    		location,
    		style,
    		options,
    		minzoom,
    		maxzoom,
    		controls,
    		tabbable,
    		interactive,
    		attribution,
    		$$scope,
    		slots,
    		div_binding
    	];
    }

    class Map$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			map: 4,
    			id: 0,
    			location: 9,
    			style: 10,
    			css: 1,
    			options: 11,
    			minzoom: 12,
    			maxzoom: 13,
    			controls: 14,
    			tabbable: 15,
    			zoom: 5,
    			center: 6,
    			pitch: 7,
    			bearing: 8,
    			interactive: 16,
    			attribution: 17
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Map",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get map() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set map(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get location() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set location(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get css() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set css(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get options() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get minzoom() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set minzoom(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxzoom() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxzoom(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get controls() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set controls(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tabbable() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabbable(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zoom() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zoom(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get center() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set center(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pitch() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pitch(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bearing() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bearing(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get interactive() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set interactive(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get attribution() {
    		throw new Error("<Map>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set attribution(value) {
    		throw new Error("<Map>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\MapSource.svelte generated by Svelte v3.59.2 */

    const { console: console_1$1 } = globals;

    // (147:0) {#if loaded}
    function create_if_block$1(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[12].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[11], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2048)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[11],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[11])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[11], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(147:0) {#if loaded}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*loaded*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*loaded*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*loaded*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function sleep$1(ms = 1000) {
    	return new Promise(resolve => setTimeout(resolve, ms));
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MapSource', slots, ['default']);
    	let { id } = $$props;
    	let { type } = $$props;
    	let { url = null } = $$props;
    	let { props = {} } = $$props;
    	let { data = null } = $$props;
    	let { layer = null } = $$props;
    	let { promoteId = null } = $$props;
    	let { minzoom = null } = $$props;
    	let { maxzoom = null } = $$props;
    	let { tilesize = 256 } = $$props;
    	let loaded = false;
    	let urlPrev = url;
    	const { getMap } = getContext('map');
    	const map = getMap();
    	setContext("source", { source: id, layer, promoteId });

    	if (map.getSource(id)) {
    		map.removeSource(id);
    	}

    	async function isSourceLoaded() {
    		await sleep$1(100);

    		if (map.isSourceLoaded(id)) {
    			$$invalidate(0, loaded = true);
    			console.debug(id + ' map source loaded!');
    		} else {
    			console.debug('...');
    			isSourceLoaded();
    		}
    	}

    	// Set optional source properties
    	if (minzoom) {
    		props.minzoom = minzoom;
    	}

    	if (maxzoom) {
    		props.maxzoom = maxzoom;
    	}

    	if (layer && promoteId) {
    		props.promoteId = {};
    		props.promoteId[layer] = promoteId;
    	} else if (promoteId) {
    		props.promoteId = promoteId;
    	}

    	function addSource() {
    		console.debug(id + ' map source loading...');
    		let layerdef;

    		if (type == "geojson") {
    			if (data) {
    				layerdef = { type, data, ...props };
    			} else if (url) {
    				layerdef = { type, data: url, ...props };
    			}
    		} else if (type == "vector") {
    			layerdef = { type, tiles: [url], ...props };
    		} else if (type == "raster") {
    			layerdef = {
    				type,
    				tiles: [url],
    				tileSize: tilesize,
    				...props
    			};
    		} else if (type == "raster-dem") {
    			layerdef = {
    				type,
    				tiles: [url],
    				tileSize: tilesize,
    				...props
    			};
    		}

    		if (layerdef) {
    			map.addSource(id, layerdef);
    			isSourceLoaded();
    		}
    	}

    	function setData(data) {
    		let source = map.getSource(id);
    		if (source) source.setData(data);
    	}

    	function setVectorTiles(url) {
    		if (url !== urlPrev) {
    			let source = map.getSource(id);
    			if (source) source.setTiles([url]);
    			urlPrev = url;
    		}
    	}

    	function setRasterTiles(url) {
    		if (url !== urlPrev) {
    			map.getSource(id).tiles = [url];
    			map.style.sourceCaches[id].clearTiles();
    			map.style.sourceCaches[id].update(map.transform);
    			map.triggerRepaint();
    			urlPrev = url;
    		}
    	}

    	onMount(addSource);

    	onDestroy(async () => {
    		if (typeof map?.getSource === "function" && map.getSource(id)) {
    			let layers = map.getStyle().layers;

    			layers.filter(l => l.source == id).forEach(l => {
    				map.removeLayer(l.id);
    			});

    			map.removeSource(id);
    		}
    	});

    	$$self.$$.on_mount.push(function () {
    		if (id === undefined && !('id' in $$props || $$self.$$.bound[$$self.$$.props['id']])) {
    			console_1$1.warn("<MapSource> was created without expected prop 'id'");
    		}

    		if (type === undefined && !('type' in $$props || $$self.$$.bound[$$self.$$.props['type']])) {
    			console_1$1.warn("<MapSource> was created without expected prop 'type'");
    		}
    	});

    	const writable_props = [
    		'id',
    		'type',
    		'url',
    		'props',
    		'data',
    		'layer',
    		'promoteId',
    		'minzoom',
    		'maxzoom',
    		'tilesize'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<MapSource> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(2, id = $$props.id);
    		if ('type' in $$props) $$invalidate(3, type = $$props.type);
    		if ('url' in $$props) $$invalidate(4, url = $$props.url);
    		if ('props' in $$props) $$invalidate(1, props = $$props.props);
    		if ('data' in $$props) $$invalidate(5, data = $$props.data);
    		if ('layer' in $$props) $$invalidate(6, layer = $$props.layer);
    		if ('promoteId' in $$props) $$invalidate(7, promoteId = $$props.promoteId);
    		if ('minzoom' in $$props) $$invalidate(8, minzoom = $$props.minzoom);
    		if ('maxzoom' in $$props) $$invalidate(9, maxzoom = $$props.maxzoom);
    		if ('tilesize' in $$props) $$invalidate(10, tilesize = $$props.tilesize);
    		if ('$$scope' in $$props) $$invalidate(11, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		onMount,
    		onDestroy,
    		id,
    		type,
    		url,
    		props,
    		data,
    		layer,
    		promoteId,
    		minzoom,
    		maxzoom,
    		tilesize,
    		loaded,
    		urlPrev,
    		getMap,
    		map,
    		sleep: sleep$1,
    		isSourceLoaded,
    		addSource,
    		setData,
    		setVectorTiles,
    		setRasterTiles
    	});

    	$$self.$inject_state = $$props => {
    		if ('id' in $$props) $$invalidate(2, id = $$props.id);
    		if ('type' in $$props) $$invalidate(3, type = $$props.type);
    		if ('url' in $$props) $$invalidate(4, url = $$props.url);
    		if ('props' in $$props) $$invalidate(1, props = $$props.props);
    		if ('data' in $$props) $$invalidate(5, data = $$props.data);
    		if ('layer' in $$props) $$invalidate(6, layer = $$props.layer);
    		if ('promoteId' in $$props) $$invalidate(7, promoteId = $$props.promoteId);
    		if ('minzoom' in $$props) $$invalidate(8, minzoom = $$props.minzoom);
    		if ('maxzoom' in $$props) $$invalidate(9, maxzoom = $$props.maxzoom);
    		if ('tilesize' in $$props) $$invalidate(10, tilesize = $$props.tilesize);
    		if ('loaded' in $$props) $$invalidate(0, loaded = $$props.loaded);
    		if ('urlPrev' in $$props) urlPrev = $$props.urlPrev;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*type, loaded, data*/ 41) {
    			type == "geojson" && loaded && setData(data);
    		}

    		if ($$self.$$.dirty & /*type, loaded, url*/ 25) {
    			type == "vector" && loaded && setVectorTiles(url);
    		}

    		if ($$self.$$.dirty & /*type, loaded, url*/ 25) {
    			type == "raster" && loaded && setRasterTiles(url);
    		}
    	};

    	return [
    		loaded,
    		props,
    		id,
    		type,
    		url,
    		data,
    		layer,
    		promoteId,
    		minzoom,
    		maxzoom,
    		tilesize,
    		$$scope,
    		slots
    	];
    }

    class MapSource extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			id: 2,
    			type: 3,
    			url: 4,
    			props: 1,
    			data: 5,
    			layer: 6,
    			promoteId: 7,
    			minzoom: 8,
    			maxzoom: 9,
    			tilesize: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MapSource",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get id() {
    		throw new Error("<MapSource>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<MapSource>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<MapSource>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<MapSource>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<MapSource>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<MapSource>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get props() {
    		throw new Error("<MapSource>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set props(value) {
    		throw new Error("<MapSource>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get data() {
    		throw new Error("<MapSource>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<MapSource>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get layer() {
    		throw new Error("<MapSource>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set layer(value) {
    		throw new Error("<MapSource>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get promoteId() {
    		throw new Error("<MapSource>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set promoteId(value) {
    		throw new Error("<MapSource>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get minzoom() {
    		throw new Error("<MapSource>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set minzoom(value) {
    		throw new Error("<MapSource>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxzoom() {
    		throw new Error("<MapSource>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxzoom(value) {
    		throw new Error("<MapSource>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tilesize() {
    		throw new Error("<MapSource>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tilesize(value) {
    		throw new Error("<MapSource>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=} start
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0 && stop) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    /* src\MapLayer.svelte generated by Svelte v3.59.2 */

    const { console: console_1 } = globals;
    const get_default_slot_changes = dirty => ({ hovered: dirty[0] & /*hovered*/ 1 });
    const get_default_slot_context = ctx => ({ hovered: /*hovered*/ ctx[0] });

    function create_fragment$2(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[30].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[29], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[0] & /*$$scope, hovered*/ 536870913)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[29],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[29])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[29], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function sleep(ms = 1000) {
    	return new Promise(resolve => setTimeout(resolve, ms));
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $hoverObj;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MapLayer', slots, ['default']);
    	const dispatch = createEventDispatcher();
    	let { id } = $$props;
    	let { type } = $$props;
    	let { filter = null } = $$props;
    	let { layout = {} } = $$props;
    	let { paint = {} } = $$props;
    	let { data = null } = $$props;
    	let { colorKey = "color" } = $$props;
    	let { nameKey = null } = $$props;
    	let { valueKey = null } = $$props;
    	let { idKey = null } = $$props;
    	let { select = false } = $$props;
    	let { clickIgnore = false } = $$props;
    	let { clickCenter = false } = $$props;
    	let { selected = null } = $$props;
    	let { hover = false } = $$props;
    	let { hovered = null } = $$props;
    	let { highlight = false } = $$props;
    	let { highlightKey = 'highlighted' } = $$props;
    	let { highlighted = [] } = $$props;
    	let { order = null } = $$props;
    	let { maxzoom = null } = $$props;
    	let { minzoom = null } = $$props;
    	let { sourceLayer = null } = $$props;
    	let { visible = true } = $$props;
    	const { source, layer, promoteId } = getContext('source');
    	const { getMap } = getContext('map');
    	const map = getMap();
    	setContext("layer", { layer: id });
    	const hoverObj = writable({ id: null, feature: null, event: null });
    	validate_store(hoverObj, 'hoverObj');
    	component_subscribe($$self, hoverObj, value => $$invalidate(34, $hoverObj = value));
    	setContext("hover", hoverObj);
    	idKey = idKey ? idKey : promoteId;
    	sourceLayer = sourceLayer ? sourceLayer : layer;
    	let selectedPrev = null;
    	let hoveredPrev = null;
    	let highlightedPrev = [];
    	let _layout = { ...layout };
    	if (!layout.visibility) _layout.visibility = visible ? 'visible' : 'none';

    	let options = {
    		id,
    		type,
    		source,
    		paint,
    		'layout': _layout
    	};

    	if (filter) {
    		options['filter'] = filter;
    	}

    	if (sourceLayer) {
    		options['source-layer'] = sourceLayer;
    	}

    	if (maxzoom) {
    		options['maxzoom'] = maxzoom;
    	}

    	if (minzoom) {
    		options['minzoom'] = minzoom;
    	}

    	onMount(() => {
    		if (map.getLayer(id)) map.removeLayer(id);
    		map.addLayer(options, order);
    	});

    	// Updates "color" feature states for all geo codes in data array
    	// Assumes that each data point has the colours defined on the colorCode key
    	let stateIds = [];

    	function updateColors(data, cKey = colorKey) {
    		console.debug('updating colors...');

    		for (const id of stateIds) {
    			map.setFeatureState({ source, sourceLayer, id }, { color: null, value: null });
    		}

    		stateIds = [];

    		for (const d of data) {
    			map.setFeatureState({ source, sourceLayer, id: d[idKey] }, {
    				color: cKey ? d[cKey] : null,
    				value: valueKey ? d[valueKey] : null,
    				name: nameKey ? d[nameKey] : null
    			});

    			stateIds.push(d[idKey]);
    		}
    	}

    	// Function to update layer filter
    	function setFilter(filter) {
    		if (map.getLayer(id)) map.setFilter(id, filter);
    	}

    	// Function to update layout properties
    	function setLayout(layout) {
    		if (map.getLayer(id)) {
    			for (const key in layout) {
    				map.setLayoutProperty(id, key, layout[key]);
    			}
    		}
    	}

    	// Function to update paint properties
    	function setPaint(paint) {
    		if (map.getLayer(id)) {
    			for (const key in paint) {
    				map.setPaintProperty(id, key, paint[key]);
    			}
    		}
    	}

    	// Function to toggle layer visibility based on "visible" prop
    	function toggleVisibility(visible) {
    		if (!layout.visibility && map.getLayer(id)) map.setLayoutProperty(id, 'visibility', visible ? 'visible' : 'none');
    	}

    	// Adds a click event to change the selected geo code (if select = true for map layer)
    	if (select) {
    		map.on('click', id, e => {
    			if (e.features.length > 0 && !clickIgnore) {
    				let feature = e.features[0];
    				$$invalidate(2, selected = feature.id);
    				dispatch('select', { id: selected, feature, event: e });

    				if (selectedPrev) {
    					map.setFeatureState({ source, sourceLayer, id: selectedPrev }, { selected: false });
    				}

    				map.setFeatureState({ source, sourceLayer, id: selected }, { selected: true });

    				if (clickCenter) {
    					let center = centroid(e.features[0].toJSON().geometry);
    					map.flyTo({ center: center.geometry.coordinates });
    				}

    				$$invalidate(26, selectedPrev = selected);
    			}
    		});
    	}

    	// Adds an event to update the hovered geo code when the mouse is moved over the map
    	if (hover) {
    		map.on('mousemove', id, e => {
    			if (e.features.length > 0) {
    				if (hovered) {
    					map.setFeatureState({ source, sourceLayer, id: hovered }, { hovered: false });
    				}

    				let feature = e.features[0];
    				$$invalidate(0, hovered = $$invalidate(27, hoveredPrev = feature.id));
    				hoverObj.set({ id: hovered, feature, event: e });
    				dispatch('hover', $hoverObj);
    				map.setFeatureState({ source, sourceLayer, id: hovered }, { hovered: true });

    				// Change the cursor style as a UI indicator.
    				map.getCanvas().style.cursor = 'pointer';
    			}
    		});

    		map.on('mouseleave', id, e => {
    			if (hovered) {
    				map.setFeatureState({ source, sourceLayer, id: hovered }, { hovered: false });
    			}

    			$$invalidate(0, hovered = $$invalidate(27, hoveredPrev = null));
    			hoverObj.set({ id: null, feature: null, event: e });
    			dispatch('hover', $hoverObj);

    			// Reset cursor and remove popup
    			map.getCanvas().style.cursor = '';
    		});
    	}

    	onDestroy(async () => {
    		if (typeof map?.getLayer === "function" && map.getLayer(id)) map.removeLayer(id);
    	});

    	$$self.$$.on_mount.push(function () {
    		if (id === undefined && !('id' in $$props || $$self.$$.bound[$$self.$$.props['id']])) {
    			console_1.warn("<MapLayer> was created without expected prop 'id'");
    		}

    		if (type === undefined && !('type' in $$props || $$self.$$.bound[$$self.$$.props['type']])) {
    			console_1.warn("<MapLayer> was created without expected prop 'type'");
    		}
    	});

    	const writable_props = [
    		'id',
    		'type',
    		'filter',
    		'layout',
    		'paint',
    		'data',
    		'colorKey',
    		'nameKey',
    		'valueKey',
    		'idKey',
    		'select',
    		'clickIgnore',
    		'clickCenter',
    		'selected',
    		'hover',
    		'hovered',
    		'highlight',
    		'highlightKey',
    		'highlighted',
    		'order',
    		'maxzoom',
    		'minzoom',
    		'sourceLayer',
    		'visible'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<MapLayer> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(5, id = $$props.id);
    		if ('type' in $$props) $$invalidate(6, type = $$props.type);
    		if ('filter' in $$props) $$invalidate(7, filter = $$props.filter);
    		if ('layout' in $$props) $$invalidate(8, layout = $$props.layout);
    		if ('paint' in $$props) $$invalidate(9, paint = $$props.paint);
    		if ('data' in $$props) $$invalidate(10, data = $$props.data);
    		if ('colorKey' in $$props) $$invalidate(11, colorKey = $$props.colorKey);
    		if ('nameKey' in $$props) $$invalidate(12, nameKey = $$props.nameKey);
    		if ('valueKey' in $$props) $$invalidate(13, valueKey = $$props.valueKey);
    		if ('idKey' in $$props) $$invalidate(4, idKey = $$props.idKey);
    		if ('select' in $$props) $$invalidate(14, select = $$props.select);
    		if ('clickIgnore' in $$props) $$invalidate(15, clickIgnore = $$props.clickIgnore);
    		if ('clickCenter' in $$props) $$invalidate(16, clickCenter = $$props.clickCenter);
    		if ('selected' in $$props) $$invalidate(2, selected = $$props.selected);
    		if ('hover' in $$props) $$invalidate(17, hover = $$props.hover);
    		if ('hovered' in $$props) $$invalidate(0, hovered = $$props.hovered);
    		if ('highlight' in $$props) $$invalidate(18, highlight = $$props.highlight);
    		if ('highlightKey' in $$props) $$invalidate(19, highlightKey = $$props.highlightKey);
    		if ('highlighted' in $$props) $$invalidate(20, highlighted = $$props.highlighted);
    		if ('order' in $$props) $$invalidate(21, order = $$props.order);
    		if ('maxzoom' in $$props) $$invalidate(22, maxzoom = $$props.maxzoom);
    		if ('minzoom' in $$props) $$invalidate(23, minzoom = $$props.minzoom);
    		if ('sourceLayer' in $$props) $$invalidate(3, sourceLayer = $$props.sourceLayer);
    		if ('visible' in $$props) $$invalidate(24, visible = $$props.visible);
    		if ('$$scope' in $$props) $$invalidate(29, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		createEventDispatcher,
    		onDestroy,
    		onMount,
    		writable,
    		dispatch,
    		id,
    		type,
    		filter,
    		layout,
    		paint,
    		data,
    		colorKey,
    		nameKey,
    		valueKey,
    		idKey,
    		select,
    		clickIgnore,
    		clickCenter,
    		selected,
    		hover,
    		hovered,
    		highlight,
    		highlightKey,
    		highlighted,
    		order,
    		maxzoom,
    		minzoom,
    		sourceLayer,
    		visible,
    		source,
    		layer,
    		promoteId,
    		getMap,
    		map,
    		hoverObj,
    		sleep,
    		selectedPrev,
    		hoveredPrev,
    		highlightedPrev,
    		_layout,
    		options,
    		stateIds,
    		updateColors,
    		setFilter,
    		setLayout,
    		setPaint,
    		toggleVisibility,
    		$hoverObj
    	});

    	$$self.$inject_state = $$props => {
    		if ('id' in $$props) $$invalidate(5, id = $$props.id);
    		if ('type' in $$props) $$invalidate(6, type = $$props.type);
    		if ('filter' in $$props) $$invalidate(7, filter = $$props.filter);
    		if ('layout' in $$props) $$invalidate(8, layout = $$props.layout);
    		if ('paint' in $$props) $$invalidate(9, paint = $$props.paint);
    		if ('data' in $$props) $$invalidate(10, data = $$props.data);
    		if ('colorKey' in $$props) $$invalidate(11, colorKey = $$props.colorKey);
    		if ('nameKey' in $$props) $$invalidate(12, nameKey = $$props.nameKey);
    		if ('valueKey' in $$props) $$invalidate(13, valueKey = $$props.valueKey);
    		if ('idKey' in $$props) $$invalidate(4, idKey = $$props.idKey);
    		if ('select' in $$props) $$invalidate(14, select = $$props.select);
    		if ('clickIgnore' in $$props) $$invalidate(15, clickIgnore = $$props.clickIgnore);
    		if ('clickCenter' in $$props) $$invalidate(16, clickCenter = $$props.clickCenter);
    		if ('selected' in $$props) $$invalidate(2, selected = $$props.selected);
    		if ('hover' in $$props) $$invalidate(17, hover = $$props.hover);
    		if ('hovered' in $$props) $$invalidate(0, hovered = $$props.hovered);
    		if ('highlight' in $$props) $$invalidate(18, highlight = $$props.highlight);
    		if ('highlightKey' in $$props) $$invalidate(19, highlightKey = $$props.highlightKey);
    		if ('highlighted' in $$props) $$invalidate(20, highlighted = $$props.highlighted);
    		if ('order' in $$props) $$invalidate(21, order = $$props.order);
    		if ('maxzoom' in $$props) $$invalidate(22, maxzoom = $$props.maxzoom);
    		if ('minzoom' in $$props) $$invalidate(23, minzoom = $$props.minzoom);
    		if ('sourceLayer' in $$props) $$invalidate(3, sourceLayer = $$props.sourceLayer);
    		if ('visible' in $$props) $$invalidate(24, visible = $$props.visible);
    		if ('selectedPrev' in $$props) $$invalidate(26, selectedPrev = $$props.selectedPrev);
    		if ('hoveredPrev' in $$props) $$invalidate(27, hoveredPrev = $$props.hoveredPrev);
    		if ('highlightedPrev' in $$props) $$invalidate(28, highlightedPrev = $$props.highlightedPrev);
    		if ('_layout' in $$props) _layout = $$props._layout;
    		if ('options' in $$props) options = $$props.options;
    		if ('stateIds' in $$props) stateIds = $$props.stateIds;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*data, colorKey*/ 3072) {
    			data && updateColors(data, colorKey);
    		}

    		if ($$self.$$.dirty[0] & /*filter*/ 128) {
    			setFilter(filter);
    		}

    		if ($$self.$$.dirty[0] & /*layout*/ 256) {
    			setLayout(layout);
    		}

    		if ($$self.$$.dirty[0] & /*paint*/ 512) {
    			setPaint(paint);
    		}

    		if ($$self.$$.dirty[0] & /*visible*/ 16777216) {
    			toggleVisibility(visible);
    		}

    		if ($$self.$$.dirty[0] & /*highlight, highlighted, highlightedPrev, highlightKey, sourceLayer*/ 270270472) {
    			// Updates the "highlighted" feature state as geo codes are added to/removed from the highlighted array
    			if (highlight && highlighted != highlightedPrev) {
    				if (highlightedPrev[0]) {
    					for (const id of highlightedPrev) {
    						let state = {};
    						state[highlightKey] = false;
    						map.setFeatureState({ source, sourceLayer, id }, state);
    					}
    				}

    				$$invalidate(28, highlightedPrev = highlighted);

    				if (highlighted[0]) {
    					for (const id of highlighted) {
    						let state = {};
    						state[highlightKey] = true;
    						map.setFeatureState({ source, sourceLayer, id }, state);
    					}
    				}
    			}
    		}

    		if ($$self.$$.dirty[0] & /*select, selected, selectedPrev, sourceLayer*/ 67125260) {
    			// Updates the selected geo code if it is changed elsewhere in the app (outside of this component)
    			if (select && selected != selectedPrev) {
    				if (selectedPrev) {
    					map.setFeatureState({ source, sourceLayer, id: selectedPrev }, { selected: false });
    				}

    				if (selected) {
    					map.setFeatureState({ source, sourceLayer, id: selected }, { selected: true });
    				}

    				$$invalidate(26, selectedPrev = selected);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*hover, hovered, hoveredPrev, sourceLayer*/ 134348809) {
    			// Updates the hovered geo code if it is changed elsewhere in the app (outside of this component)
    			if (hover && hovered != hoveredPrev) {
    				if (hoveredPrev) {
    					map.setFeatureState({ source, sourceLayer, id: hoveredPrev }, { hovered: false });
    				}

    				if (hovered) {
    					map.setFeatureState({ source, sourceLayer, id: hovered }, { hovered: true });
    				}

    				$$invalidate(27, hoveredPrev = hovered);
    			}
    		}
    	};

    	return [
    		hovered,
    		hoverObj,
    		selected,
    		sourceLayer,
    		idKey,
    		id,
    		type,
    		filter,
    		layout,
    		paint,
    		data,
    		colorKey,
    		nameKey,
    		valueKey,
    		select,
    		clickIgnore,
    		clickCenter,
    		hover,
    		highlight,
    		highlightKey,
    		highlighted,
    		order,
    		maxzoom,
    		minzoom,
    		visible,
    		updateColors,
    		selectedPrev,
    		hoveredPrev,
    		highlightedPrev,
    		$$scope,
    		slots
    	];
    }

    class MapLayer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$2,
    			create_fragment$2,
    			safe_not_equal,
    			{
    				id: 5,
    				type: 6,
    				filter: 7,
    				layout: 8,
    				paint: 9,
    				data: 10,
    				colorKey: 11,
    				nameKey: 12,
    				valueKey: 13,
    				idKey: 4,
    				select: 14,
    				clickIgnore: 15,
    				clickCenter: 16,
    				selected: 2,
    				hover: 17,
    				hovered: 0,
    				highlight: 18,
    				highlightKey: 19,
    				highlighted: 20,
    				order: 21,
    				maxzoom: 22,
    				minzoom: 23,
    				sourceLayer: 3,
    				visible: 24,
    				updateColors: 25
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MapLayer",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get id() {
    		throw new Error("<MapLayer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<MapLayer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<MapLayer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<MapLayer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filter() {
    		throw new Error("<MapLayer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filter(value) {
    		throw new Error("<MapLayer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get layout() {
    		throw new Error("<MapLayer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set layout(value) {
    		throw new Error("<MapLayer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get paint() {
    		throw new Error("<MapLayer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set paint(value) {
    		throw new Error("<MapLayer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get data() {
    		throw new Error("<MapLayer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<MapLayer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get colorKey() {
    		throw new Error("<MapLayer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set colorKey(value) {
    		throw new Error("<MapLayer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nameKey() {
    		throw new Error("<MapLayer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nameKey(value) {
    		throw new Error("<MapLayer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get valueKey() {
    		throw new Error("<MapLayer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set valueKey(value) {
    		throw new Error("<MapLayer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get idKey() {
    		throw new Error("<MapLayer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set idKey(value) {
    		throw new Error("<MapLayer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get select() {
    		throw new Error("<MapLayer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set select(value) {
    		throw new Error("<MapLayer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get clickIgnore() {
    		throw new Error("<MapLayer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set clickIgnore(value) {
    		throw new Error("<MapLayer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get clickCenter() {
    		throw new Error("<MapLayer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set clickCenter(value) {
    		throw new Error("<MapLayer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<MapLayer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<MapLayer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hover() {
    		throw new Error("<MapLayer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hover(value) {
    		throw new Error("<MapLayer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hovered() {
    		throw new Error("<MapLayer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hovered(value) {
    		throw new Error("<MapLayer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get highlight() {
    		throw new Error("<MapLayer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set highlight(value) {
    		throw new Error("<MapLayer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get highlightKey() {
    		throw new Error("<MapLayer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set highlightKey(value) {
    		throw new Error("<MapLayer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get highlighted() {
    		throw new Error("<MapLayer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set highlighted(value) {
    		throw new Error("<MapLayer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get order() {
    		throw new Error("<MapLayer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set order(value) {
    		throw new Error("<MapLayer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxzoom() {
    		throw new Error("<MapLayer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxzoom(value) {
    		throw new Error("<MapLayer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get minzoom() {
    		throw new Error("<MapLayer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set minzoom(value) {
    		throw new Error("<MapLayer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get sourceLayer() {
    		throw new Error("<MapLayer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set sourceLayer(value) {
    		throw new Error("<MapLayer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get visible() {
    		throw new Error("<MapLayer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set visible(value) {
    		throw new Error("<MapLayer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get updateColors() {
    		return this.$$.ctx[25];
    	}

    	set updateColors(value) {
    		throw new Error("<MapLayer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\MapTooltip.svelte generated by Svelte v3.59.2 */

    function create_fragment$1(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $hoverObj;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MapTooltip', slots, []);
    	let { content } = $$props;
    	const tooltip = new maplibre.Popup({ closeButton: false, closeOnClick: false });
    	const { getMap } = getContext('map');
    	const map = getMap();
    	const hoverObj = getContext('hover');
    	validate_store(hoverObj, 'hoverObj');
    	component_subscribe($$self, hoverObj, value => $$invalidate(2, $hoverObj = value));

    	function updateTooltip(obj, content) {
    		if (obj.id) {
    			tooltip.setLngLat(obj.event.lngLat).setHTML(content ? content : obj.code).addTo(map);
    		} else {
    			tooltip.remove();
    		}
    	}

    	onDestroy(() => tooltip.remove());

    	$$self.$$.on_mount.push(function () {
    		if (content === undefined && !('content' in $$props || $$self.$$.bound[$$self.$$.props['content']])) {
    			console.warn("<MapTooltip> was created without expected prop 'content'");
    		}
    	});

    	const writable_props = ['content'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MapTooltip> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('content' in $$props) $$invalidate(1, content = $$props.content);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onDestroy,
    		maplibre,
    		content,
    		tooltip,
    		getMap,
    		map,
    		hoverObj,
    		updateTooltip,
    		$hoverObj
    	});

    	$$self.$inject_state = $$props => {
    		if ('content' in $$props) $$invalidate(1, content = $$props.content);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$hoverObj, content*/ 6) {
    			updateTooltip($hoverObj, content);
    		}
    	};

    	return [hoverObj, content, $hoverObj];
    }

    class MapTooltip extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { content: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MapTooltip",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get content() {
    		throw new Error("<MapTooltip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set content(value) {
    		throw new Error("<MapTooltip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.59.2 */
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[32] = list[i];
    	return child_ctx;
    }

    // (105:4) {#each baseMaps as option}
    function create_each_block(ctx) {
    	let option;
    	let t_value = /*option*/ ctx[32].label + "";
    	let t;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = /*option*/ ctx[32];
    			option.value = option.__value;
    			add_location(option, file, 105, 4, 2726);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(105:4) {#each baseMaps as option}",
    		ctx
    	});

    	return block;
    }

    // (135:5) {#if geojson && data.pcon}
    function create_if_block_6(ctx) {
    	let map;
    	let updating_map;
    	let current;

    	function map_map_binding(value) {
    		/*map_map_binding*/ ctx[25](value);
    	}

    	let map_props = {
    		id: "map2",
    		style: /*baseMap*/ ctx[13].path,
    		location: { bounds: /*bounds*/ ctx[16].uk },
    		controls: true,
    		$$slots: { default: [create_default_slot_5] },
    		$$scope: { ctx }
    	};

    	if (/*map2*/ ctx[1] !== void 0) {
    		map_props.map = /*map2*/ ctx[1];
    	}

    	map = new Map$1({ props: map_props, $$inline: true });
    	binding_callbacks.push(() => bind(map, 'map', map_map_binding));

    	const block = {
    		c: function create() {
    			create_component(map.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(map, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const map_changes = {};
    			if (dirty[0] & /*baseMap*/ 8192) map_changes.style = /*baseMap*/ ctx[13].path;

    			if (dirty[0] & /*geojson, data, baseMap, visLayers, showLayers, showSources*/ 15408 | dirty[1] & /*$$scope*/ 16) {
    				map_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_map && dirty[0] & /*map2*/ 2) {
    				updating_map = true;
    				map_changes.map = /*map2*/ ctx[1];
    				add_flush_callback(() => updating_map = false);
    			}

    			map.$set(map_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(map.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(map.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(map, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(135:5) {#if geojson && data.pcon}",
    		ctx
    	});

    	return block;
    }

    // (137:5) {#if showSources}
    function create_if_block_7(ctx) {
    	let mapsource;
    	let current;

    	mapsource = new MapSource({
    			props: {
    				id: "pcon",
    				type: "geojson",
    				data: /*geojson*/ ctx[5],
    				promoteId: /*pconBounds*/ ctx[14].code,
    				maxzoom: 13,
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(mapsource.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(mapsource, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const mapsource_changes = {};
    			if (dirty[0] & /*geojson*/ 32) mapsource_changes.data = /*geojson*/ ctx[5];

    			if (dirty[0] & /*data, baseMap, visLayers, showLayers*/ 14352 | dirty[1] & /*$$scope*/ 16) {
    				mapsource_changes.$$scope = { dirty, ctx };
    			}

    			mapsource.$set(mapsource_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mapsource.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mapsource.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(mapsource, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(137:5) {#if showSources}",
    		ctx
    	});

    	return block;
    }

    // (144:6) {#if showLayers}
    function create_if_block_8(ctx) {
    	let maplayer;
    	let current;

    	maplayer = new MapLayer({
    			props: {
    				id: "pcon",
    				data: /*data*/ ctx[4].pcon,
    				type: "fill",
    				paint: {
    					'fill-color': [
    						'case',
    						['!=', ['feature-state', 'color'], null],
    						['feature-state', 'color'],
    						'rgba(255, 255, 255, 0)'
    					],
    					'fill-opacity': 0.7
    				},
    				order: /*baseMap*/ ctx[13].key === "omt" ? "water_name" : null,
    				visible: /*visLayers*/ ctx[12]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(maplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(maplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const maplayer_changes = {};
    			if (dirty[0] & /*data*/ 16) maplayer_changes.data = /*data*/ ctx[4].pcon;
    			if (dirty[0] & /*baseMap*/ 8192) maplayer_changes.order = /*baseMap*/ ctx[13].key === "omt" ? "water_name" : null;
    			if (dirty[0] & /*visLayers*/ 4096) maplayer_changes.visible = /*visLayers*/ ctx[12];
    			maplayer.$set(maplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(maplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(maplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(maplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_8.name,
    		type: "if",
    		source: "(144:6) {#if showLayers}",
    		ctx
    	});

    	return block;
    }

    // (138:6) <MapSource         id="pcon"         type="geojson"         data={geojson}         promoteId={pconBounds.code}         maxzoom={13}>
    function create_default_slot_6(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*showLayers*/ ctx[11] && create_if_block_8(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*showLayers*/ ctx[11]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*showLayers*/ 2048) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_8(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(138:6) <MapSource         id=\\\"pcon\\\"         type=\\\"geojson\\\"         data={geojson}         promoteId={pconBounds.code}         maxzoom={13}>",
    		ctx
    	});

    	return block;
    }

    // (136:5) <Map id="map2" style={baseMap.path} location={{bounds: bounds.uk}} bind:map={map2} controls={true}>
    function create_default_slot_5(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*showSources*/ ctx[10] && create_if_block_7(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*showSources*/ ctx[10]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*showSources*/ 1024) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_7(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(136:5) <Map id=\\\"map2\\\" style={baseMap.path} location={{bounds: bounds.uk}} bind:map={map2} controls={true}>",
    		ctx
    	});

    	return block;
    }

    // (169:5) {#if geojson && data.pcon}
    function create_if_block_3(ctx) {
    	let map;
    	let updating_map;
    	let current;

    	function map_map_binding_1(value) {
    		/*map_map_binding_1*/ ctx[28](value);
    	}

    	let map_props = {
    		id: "map3",
    		style: /*baseMap*/ ctx[13].path,
    		location: { bounds: /*bounds*/ ctx[16].uk },
    		controls: true,
    		$$slots: { default: [create_default_slot_2] },
    		$$scope: { ctx }
    	};

    	if (/*map3*/ ctx[2] !== void 0) {
    		map_props.map = /*map3*/ ctx[2];
    	}

    	map = new Map$1({ props: map_props, $$inline: true });
    	binding_callbacks.push(() => bind(map, 'map', map_map_binding_1));

    	const block = {
    		c: function create() {
    			create_component(map.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(map, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const map_changes = {};
    			if (dirty[0] & /*baseMap*/ 8192) map_changes.style = /*baseMap*/ ctx[13].path;

    			if (dirty[0] & /*geojson, visLayers, data, baseMap, hovered, selected, showLayers, showSources*/ 16176 | dirty[1] & /*$$scope*/ 16) {
    				map_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_map && dirty[0] & /*map3*/ 4) {
    				updating_map = true;
    				map_changes.map = /*map3*/ ctx[2];
    				add_flush_callback(() => updating_map = false);
    			}

    			map.$set(map_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(map.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(map.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(map, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(169:5) {#if geojson && data.pcon}",
    		ctx
    	});

    	return block;
    }

    // (171:5) {#if showSources}
    function create_if_block_4(ctx) {
    	let mapsource;
    	let current;

    	mapsource = new MapSource({
    			props: {
    				id: "pcon",
    				type: "geojson",
    				data: /*geojson*/ ctx[5],
    				promoteId: /*pconBounds*/ ctx[14].code,
    				maxzoom: 13,
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(mapsource.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(mapsource, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const mapsource_changes = {};
    			if (dirty[0] & /*geojson*/ 32) mapsource_changes.data = /*geojson*/ ctx[5];

    			if (dirty[0] & /*visLayers, data, baseMap, hovered, selected, showLayers*/ 15120 | dirty[1] & /*$$scope*/ 16) {
    				mapsource_changes.$$scope = { dirty, ctx };
    			}

    			mapsource.$set(mapsource_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mapsource.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mapsource.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(mapsource, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(171:5) {#if showSources}",
    		ctx
    	});

    	return block;
    }

    // (178:6) {#if showLayers}
    function create_if_block_5(ctx) {
    	let maplayer0;
    	let updating_hovered;
    	let updating_selected;
    	let t;
    	let maplayer1;
    	let current;

    	function maplayer0_hovered_binding(value) {
    		/*maplayer0_hovered_binding*/ ctx[26](value);
    	}

    	function maplayer0_selected_binding(value) {
    		/*maplayer0_selected_binding*/ ctx[27](value);
    	}

    	let maplayer0_props = {
    		id: "pcon-fill",
    		data: /*data*/ ctx[4].pcon,
    		type: "fill",
    		hover: true,
    		select: true,
    		paint: {
    			'fill-color': [
    				'case',
    				['!=', ['feature-state', 'color'], null],
    				['feature-state', 'color'],
    				'rgba(255, 255, 255, 0)'
    			],
    			'fill-opacity': 0.7
    		},
    		order: /*baseMap*/ ctx[13].key === "omt" ? "water_name" : null,
    		visible: /*visLayers*/ ctx[12],
    		$$slots: { default: [create_default_slot_4] },
    		$$scope: { ctx }
    	};

    	if (/*hovered*/ ctx[8] !== void 0) {
    		maplayer0_props.hovered = /*hovered*/ ctx[8];
    	}

    	if (/*selected*/ ctx[9] !== void 0) {
    		maplayer0_props.selected = /*selected*/ ctx[9];
    	}

    	maplayer0 = new MapLayer({ props: maplayer0_props, $$inline: true });
    	binding_callbacks.push(() => bind(maplayer0, 'hovered', maplayer0_hovered_binding));
    	binding_callbacks.push(() => bind(maplayer0, 'selected', maplayer0_selected_binding));

    	maplayer1 = new MapLayer({
    			props: {
    				id: "pcon-line",
    				type: "line",
    				paint: {
    					'line-color': [
    						'case',
    						['==', ['feature-state', 'selected'], true],
    						'black',
    						['==', ['feature-state', 'hovered'], true],
    						'orange',
    						'rgba(255, 255, 255, 0)'
    					],
    					'line-width': ['case', ['==', ['feature-state', 'selected'], true], 2, 1]
    				},
    				visible: /*visLayers*/ ctx[12]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(maplayer0.$$.fragment);
    			t = space();
    			create_component(maplayer1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(maplayer0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(maplayer1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const maplayer0_changes = {};
    			if (dirty[0] & /*data*/ 16) maplayer0_changes.data = /*data*/ ctx[4].pcon;
    			if (dirty[0] & /*baseMap*/ 8192) maplayer0_changes.order = /*baseMap*/ ctx[13].key === "omt" ? "water_name" : null;
    			if (dirty[0] & /*visLayers*/ 4096) maplayer0_changes.visible = /*visLayers*/ ctx[12];

    			if (dirty[0] & /*hovered*/ 256 | dirty[1] & /*$$scope*/ 16) {
    				maplayer0_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_hovered && dirty[0] & /*hovered*/ 256) {
    				updating_hovered = true;
    				maplayer0_changes.hovered = /*hovered*/ ctx[8];
    				add_flush_callback(() => updating_hovered = false);
    			}

    			if (!updating_selected && dirty[0] & /*selected*/ 512) {
    				updating_selected = true;
    				maplayer0_changes.selected = /*selected*/ ctx[9];
    				add_flush_callback(() => updating_selected = false);
    			}

    			maplayer0.$set(maplayer0_changes);
    			const maplayer1_changes = {};
    			if (dirty[0] & /*visLayers*/ 4096) maplayer1_changes.visible = /*visLayers*/ ctx[12];
    			maplayer1.$set(maplayer1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(maplayer0.$$.fragment, local);
    			transition_in(maplayer1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(maplayer0.$$.fragment, local);
    			transition_out(maplayer1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(maplayer0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(maplayer1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(178:6) {#if showLayers}",
    		ctx
    	});

    	return block;
    }

    // (179:7) <MapLayer          id="pcon-fill"          data={data.pcon}          type="fill"          hover={true}          bind:hovered          select={true}          bind:selected          paint={{           'fill-color': ['case',            ['!=', ['feature-state', 'color'], null], ['feature-state', 'color'],            'rgba(255, 255, 255, 0)'           ],           'fill-opacity': 0.7          }}         order={baseMap.key === "omt" ? "water_name" : null}         visible={visLayers}          >
    function create_default_slot_4(ctx) {
    	let maptooltip;
    	let current;

    	maptooltip = new MapTooltip({
    			props: { content: `Code: ${/*hovered*/ ctx[8]}` },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(maptooltip.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(maptooltip, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const maptooltip_changes = {};
    			if (dirty[0] & /*hovered*/ 256) maptooltip_changes.content = `Code: ${/*hovered*/ ctx[8]}`;
    			maptooltip.$set(maptooltip_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(maptooltip.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(maptooltip.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(maptooltip, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(179:7) <MapLayer          id=\\\"pcon-fill\\\"          data={data.pcon}          type=\\\"fill\\\"          hover={true}          bind:hovered          select={true}          bind:selected          paint={{           'fill-color': ['case',            ['!=', ['feature-state', 'color'], null], ['feature-state', 'color'],            'rgba(255, 255, 255, 0)'           ],           'fill-opacity': 0.7          }}         order={baseMap.key === \\\"omt\\\" ? \\\"water_name\\\" : null}         visible={visLayers}          >",
    		ctx
    	});

    	return block;
    }

    // (172:6) <MapSource         id="pcon"         type="geojson"         data={geojson}         promoteId={pconBounds.code}         maxzoom={13}>
    function create_default_slot_3(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*showLayers*/ ctx[11] && create_if_block_5(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*showLayers*/ ctx[11]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*showLayers*/ 2048) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_5(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(172:6) <MapSource         id=\\\"pcon\\\"         type=\\\"geojson\\\"         data={geojson}         promoteId={pconBounds.code}         maxzoom={13}>",
    		ctx
    	});

    	return block;
    }

    // (170:5) <Map id="map3" style={baseMap.path} location={{bounds: bounds.uk}} bind:map={map3} controls={true}>
    function create_default_slot_2(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*showSources*/ ctx[10] && create_if_block_4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*showSources*/ ctx[10]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*showSources*/ 1024) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(170:5) <Map id=\\\"map3\\\" style={baseMap.path} location={{bounds: bounds.uk}} bind:map={map3} controls={true}>",
    		ctx
    	});

    	return block;
    }

    // (223:13) {#if selected}
    function create_if_block_2(ctx) {
    	let t0;
    	let t1;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			t0 = text(/*selected*/ ctx[9]);
    			t1 = space();
    			button = element("button");
    			button.textContent = "x";
    			attr_dev(button, "class", "svelte-153589f");
    			add_location(button, file, 222, 39, 6001);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", prevent_default(/*click_handler*/ ctx[29]), false, true, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*selected*/ 512) set_data_dev(t0, /*selected*/ ctx[9]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(223:13) {#if selected}",
    		ctx
    	});

    	return block;
    }

    // (228:5) {#if showSources}
    function create_if_block(ctx) {
    	let mapsource;
    	let current;

    	mapsource = new MapSource({
    			props: {
    				id: "lsoa",
    				type: "vector",
    				url: /*lsoaBounds*/ ctx[15].url,
    				layer: /*lsoaBounds*/ ctx[15].layer,
    				promoteId: /*lsoaBounds*/ ctx[15].code,
    				maxzoom: 13,
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(mapsource.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(mapsource, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const mapsource_changes = {};

    			if (dirty[0] & /*data, baseMap, visLayers, showLayers*/ 14352 | dirty[1] & /*$$scope*/ 16) {
    				mapsource_changes.$$scope = { dirty, ctx };
    			}

    			mapsource.$set(mapsource_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mapsource.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mapsource.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(mapsource, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(228:5) {#if showSources}",
    		ctx
    	});

    	return block;
    }

    // (236:7) {#if showLayers && data}
    function create_if_block_1(ctx) {
    	let maplayer;
    	let current;

    	maplayer = new MapLayer({
    			props: {
    				id: "lsoa",
    				data: /*data*/ ctx[4].lsoa,
    				type: "fill",
    				minzoom: 5,
    				paint: {
    					'fill-color': [
    						'case',
    						['!=', ['feature-state', 'color'], null],
    						['feature-state', 'color'],
    						'rgba(255, 255, 255, 0)'
    					],
    					'fill-opacity': 0.8
    				},
    				order: /*baseMap*/ ctx[13].key === "omt" ? "water_name" : null,
    				visible: /*visLayers*/ ctx[12]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(maplayer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(maplayer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const maplayer_changes = {};
    			if (dirty[0] & /*data*/ 16) maplayer_changes.data = /*data*/ ctx[4].lsoa;
    			if (dirty[0] & /*baseMap*/ 8192) maplayer_changes.order = /*baseMap*/ ctx[13].key === "omt" ? "water_name" : null;
    			if (dirty[0] & /*visLayers*/ 4096) maplayer_changes.visible = /*visLayers*/ ctx[12];
    			maplayer.$set(maplayer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(maplayer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(maplayer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(maplayer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(236:7) {#if showLayers && data}",
    		ctx
    	});

    	return block;
    }

    // (229:7) <MapSource         id="lsoa"         type="vector"         url={lsoaBounds.url}         layer={lsoaBounds.layer}         promoteId={lsoaBounds.code}         maxzoom={13}>
    function create_default_slot_1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*showLayers*/ ctx[11] && /*data*/ ctx[4] && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*showLayers*/ ctx[11] && /*data*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*showLayers, data*/ 2064) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(229:7) <MapSource         id=\\\"lsoa\\\"         type=\\\"vector\\\"         url={lsoaBounds.url}         layer={lsoaBounds.layer}         promoteId={lsoaBounds.code}         maxzoom={13}>",
    		ctx
    	});

    	return block;
    }

    // (227:5) <Map id="map4" style={baseMap.path} location={{lng: -2, lat: 52, zoom: 8}} bind:map={map4} controls={true} minzoom={5}>
    function create_default_slot(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*showSources*/ ctx[10] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*showSources*/ ctx[10]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*showSources*/ 1024) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(227:5) <Map id=\\\"map4\\\" style={baseMap.path} location={{lng: -2, lat: 52, zoom: 8}} bind:map={map4} controls={true} minzoom={5}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let section0;
    	let div0;
    	let h1;
    	let t1;
    	let p0;
    	let t3;
    	let p1;
    	let t4;
    	let a;
    	let t6;
    	let t7;
    	let p2;
    	let t8;
    	let select;
    	let t9;
    	let p3;
    	let t10;
    	let label0;
    	let input0;
    	let t11;
    	let t12;
    	let label1;
    	let input1;
    	let t13;
    	let t14;
    	let p4;
    	let t15;
    	let label2;
    	let input2;
    	let t16;
    	let t17;
    	let section1;
    	let div9;
    	let div2;
    	let div1;
    	let map0;
    	let updating_map;
    	let updating_zoom;
    	let updating_center;
    	let t18;
    	let br0;
    	let t19;
    	let t20_value = (/*zoom*/ ctx[6] ? /*zoom*/ ctx[6].toFixed(1) : '') + "";
    	let t20;
    	let t21;

    	let t22_value = (/*center*/ ctx[7].lng
    	? /*center*/ ctx[7].lng.toFixed(1)
    	: '') + "";

    	let t22;
    	let t23;

    	let t24_value = (/*center*/ ctx[7].lat
    	? /*center*/ ctx[7].lat.toFixed(1)
    	: '') + "";

    	let t24;
    	let t25;
    	let t26;
    	let div4;
    	let div3;
    	let t27;
    	let t28;
    	let div6;
    	let div5;
    	let t29;
    	let br1;
    	let t30;
    	let t31_value = (/*hovered*/ ctx[8] ? /*hovered*/ ctx[8] : '') + "";
    	let t31;
    	let t32;
    	let t33;
    	let t34;
    	let div8;
    	let div7;
    	let map1_1;
    	let updating_map_1;
    	let t35;
    	let t36;
    	let section2;
    	let div10;
    	let h20;
    	let t38;
    	let p5;
    	let t40;
    	let h21;
    	let t42;
    	let ul;
    	let li0;
    	let t44;
    	let li1;
    	let t46;
    	let li2;
    	let t48;
    	let li3;
    	let t50;
    	let li4;
    	let t52;
    	let li5;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*baseMaps*/ ctx[17];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	function map0_map_binding(value) {
    		/*map0_map_binding*/ ctx[22](value);
    	}

    	function map0_zoom_binding(value) {
    		/*map0_zoom_binding*/ ctx[23](value);
    	}

    	function map0_center_binding(value) {
    		/*map0_center_binding*/ ctx[24](value);
    	}

    	let map0_props = {
    		id: "map1",
    		style: /*baseMap*/ ctx[13].path
    	};

    	if (/*map1*/ ctx[0] !== void 0) {
    		map0_props.map = /*map1*/ ctx[0];
    	}

    	if (/*zoom*/ ctx[6] !== void 0) {
    		map0_props.zoom = /*zoom*/ ctx[6];
    	}

    	if (/*center*/ ctx[7] !== void 0) {
    		map0_props.center = /*center*/ ctx[7];
    	}

    	map0 = new Map$1({ props: map0_props, $$inline: true });
    	binding_callbacks.push(() => bind(map0, 'map', map0_map_binding));
    	binding_callbacks.push(() => bind(map0, 'zoom', map0_zoom_binding));
    	binding_callbacks.push(() => bind(map0, 'center', map0_center_binding));
    	let if_block0 = /*geojson*/ ctx[5] && /*data*/ ctx[4].pcon && create_if_block_6(ctx);
    	let if_block1 = /*geojson*/ ctx[5] && /*data*/ ctx[4].pcon && create_if_block_3(ctx);
    	let if_block2 = /*selected*/ ctx[9] && create_if_block_2(ctx);

    	function map1_1_map_binding(value) {
    		/*map1_1_map_binding*/ ctx[30](value);
    	}

    	let map1_1_props = {
    		id: "map4",
    		style: /*baseMap*/ ctx[13].path,
    		location: { lng: -2, lat: 52, zoom: 8 },
    		controls: true,
    		minzoom: 5,
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	};

    	if (/*map4*/ ctx[3] !== void 0) {
    		map1_1_props.map = /*map4*/ ctx[3];
    	}

    	map1_1 = new Map$1({ props: map1_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(map1_1, 'map', map1_1_map_binding));

    	const block = {
    		c: function create() {
    			section0 = element("section");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "ONS Svelte Map Components";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "THIS IS FOR TESTING PURPOSES";
    			t3 = space();
    			p1 = element("p");
    			t4 = text("Below are a series of examples of how to use the components to display maps. View the source code of the ");
    			a = element("a");
    			a.textContent = "App.svelte";
    			t6 = text(" file in this repository to see how they are used.");
    			t7 = space();
    			p2 = element("p");
    			t8 = text("Base map:\r\n\t\t\t");
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t9 = space();
    			p3 = element("p");
    			t10 = text("Create/destroy:\r\n\t\t\t");
    			label0 = element("label");
    			input0 = element("input");
    			t11 = text(" Sources");
    			t12 = space();
    			label1 = element("label");
    			input1 = element("input");
    			t13 = text(" Layers");
    			t14 = space();
    			p4 = element("p");
    			t15 = text("Show/hide:\r\n\t\t\t");
    			label2 = element("label");
    			input2 = element("input");
    			t16 = text(" Layers");
    			t17 = space();
    			section1 = element("section");
    			div9 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			create_component(map0.$$.fragment);
    			t18 = text("\r\n\t\t\tPlain OSM base map with location bindings");
    			br0 = element("br");
    			t19 = text("\r\n\t\t\t(zoom: ");
    			t20 = text(t20_value);
    			t21 = text(",\r\n\t\t\tlon: ");
    			t22 = text(t22_value);
    			t23 = text(",\r\n\t\t\tlat: ");
    			t24 = text(t24_value);
    			t25 = text(")");
    			t26 = space();
    			div4 = element("div");
    			div3 = element("div");
    			if (if_block0) if_block0.c();
    			t27 = text("\r\n\t\t\tBasic geojson choropleth map");
    			t28 = space();
    			div6 = element("div");
    			div5 = element("div");
    			if (if_block1) if_block1.c();
    			t29 = text("\r\n\t\t\tGeojson choropleth map with hover and select");
    			br1 = element("br");
    			t30 = text("\r\n\t\t\t(hovered: ");
    			t31 = text(t31_value);
    			t32 = text(",\r\n\t\t\tselected: ");
    			if (if_block2) if_block2.c();
    			t33 = text(")");
    			t34 = space();
    			div8 = element("div");
    			div7 = element("div");
    			create_component(map1_1.$$.fragment);
    			t35 = text("\r\n\t\t\tChoropleth map using custom vector boundary tiles and OpenMapTiles basemap");
    			t36 = space();
    			section2 = element("section");
    			div10 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Current features";
    			t38 = space();
    			p5 = element("p");
    			p5.textContent = "Description to be added.";
    			t40 = space();
    			h21 = element("h2");
    			h21.textContent = "Intended features";
    			t42 = space();
    			ul = element("ul");
    			li0 = element("li");
    			li0.textContent = "Better documentation.";
    			t44 = space();
    			li1 = element("li");
    			li1.textContent = "Split screen support.";
    			t46 = space();
    			li2 = element("li");
    			li2.textContent = "Marker layer.";
    			t48 = space();
    			li3 = element("li");
    			li3.textContent = "Drawing layer.";
    			t50 = space();
    			li4 = element("li");
    			li4.textContent = "Custom layer support.";
    			t52 = space();
    			li5 = element("li");
    			li5.textContent = "Transition settings.";
    			add_location(h1, file, 98, 4, 2302);
    			add_location(p0, file, 99, 4, 2342);
    			attr_dev(a, "href", "https://github.com/ONSvisual/svelte-maps/blob/main/src/App.svelte");
    			attr_dev(a, "class", "svelte-153589f");
    			add_location(a, file, 100, 110, 2489);
    			add_location(p1, file, 100, 2, 2381);
    			if (/*baseMap*/ ctx[13] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[18].call(select));
    			add_location(select, file, 103, 3, 2659);
    			add_location(p2, file, 101, 2, 2637);
    			attr_dev(input0, "type", "checkbox");
    			add_location(input0, file, 111, 10, 2846);
    			attr_dev(label0, "class", "svelte-153589f");
    			add_location(label0, file, 111, 3, 2839);
    			attr_dev(input1, "type", "checkbox");
    			add_location(input1, file, 112, 10, 2925);
    			attr_dev(label1, "class", "svelte-153589f");
    			add_location(label1, file, 112, 3, 2918);
    			add_location(p3, file, 109, 2, 2811);
    			attr_dev(input2, "type", "checkbox");
    			add_location(input2, file, 116, 10, 3032);
    			attr_dev(label2, "class", "svelte-153589f");
    			add_location(label2, file, 116, 3, 3025);
    			add_location(p4, file, 114, 2, 3002);
    			attr_dev(div0, "class", "wrapper svelte-153589f");
    			add_location(div0, file, 97, 1, 2275);
    			attr_dev(section0, "class", "svelte-153589f");
    			add_location(section0, file, 96, 0, 2263);
    			attr_dev(div1, "class", "map svelte-153589f");
    			add_location(div1, file, 124, 3, 3174);
    			add_location(br0, file, 127, 44, 3345);
    			add_location(div2, file, 123, 2, 3164);
    			attr_dev(div3, "class", "map svelte-153589f");
    			add_location(div3, file, 133, 3, 3520);
    			add_location(div4, file, 132, 2, 3510);
    			attr_dev(div5, "class", "map svelte-153589f");
    			add_location(div5, file, 167, 3, 4409);
    			add_location(br1, file, 220, 47, 5915);
    			add_location(div6, file, 166, 2, 4399);
    			attr_dev(div7, "class", "map svelte-153589f");
    			add_location(div7, file, 225, 3, 6097);
    			add_location(div8, file, 224, 2, 6087);
    			attr_dev(div9, "class", "grid svelte-153589f");
    			add_location(div9, file, 122, 1, 3142);
    			attr_dev(section1, "class", "svelte-153589f");
    			add_location(section1, file, 121, 0, 3130);
    			attr_dev(h20, "class", "svelte-153589f");
    			add_location(h20, file, 263, 4, 7128);
    			add_location(p5, file, 264, 4, 7159);
    			attr_dev(h21, "class", "svelte-153589f");
    			add_location(h21, file, 265, 4, 7196);
    			add_location(li0, file, 267, 3, 7237);
    			add_location(li1, file, 268, 3, 7272);
    			add_location(li2, file, 269, 3, 7307);
    			add_location(li3, file, 270, 3, 7334);
    			add_location(li4, file, 271, 3, 7362);
    			add_location(li5, file, 272, 3, 7397);
    			add_location(ul, file, 266, 4, 7228);
    			attr_dev(div10, "class", "wrapper svelte-153589f");
    			add_location(div10, file, 262, 1, 7101);
    			attr_dev(section2, "class", "svelte-153589f");
    			add_location(section2, file, 261, 0, 7089);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section0, anchor);
    			append_dev(section0, div0);
    			append_dev(div0, h1);
    			append_dev(div0, t1);
    			append_dev(div0, p0);
    			append_dev(div0, t3);
    			append_dev(div0, p1);
    			append_dev(p1, t4);
    			append_dev(p1, a);
    			append_dev(p1, t6);
    			append_dev(div0, t7);
    			append_dev(div0, p2);
    			append_dev(p2, t8);
    			append_dev(p2, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(select, null);
    				}
    			}

    			select_option(select, /*baseMap*/ ctx[13], true);
    			append_dev(div0, t9);
    			append_dev(div0, p3);
    			append_dev(p3, t10);
    			append_dev(p3, label0);
    			append_dev(label0, input0);
    			input0.checked = /*showSources*/ ctx[10];
    			append_dev(label0, t11);
    			append_dev(p3, t12);
    			append_dev(p3, label1);
    			append_dev(label1, input1);
    			input1.checked = /*showLayers*/ ctx[11];
    			append_dev(label1, t13);
    			append_dev(div0, t14);
    			append_dev(div0, p4);
    			append_dev(p4, t15);
    			append_dev(p4, label2);
    			append_dev(label2, input2);
    			input2.checked = /*visLayers*/ ctx[12];
    			append_dev(label2, t16);
    			insert_dev(target, t17, anchor);
    			insert_dev(target, section1, anchor);
    			append_dev(section1, div9);
    			append_dev(div9, div2);
    			append_dev(div2, div1);
    			mount_component(map0, div1, null);
    			append_dev(div2, t18);
    			append_dev(div2, br0);
    			append_dev(div2, t19);
    			append_dev(div2, t20);
    			append_dev(div2, t21);
    			append_dev(div2, t22);
    			append_dev(div2, t23);
    			append_dev(div2, t24);
    			append_dev(div2, t25);
    			append_dev(div9, t26);
    			append_dev(div9, div4);
    			append_dev(div4, div3);
    			if (if_block0) if_block0.m(div3, null);
    			append_dev(div4, t27);
    			append_dev(div9, t28);
    			append_dev(div9, div6);
    			append_dev(div6, div5);
    			if (if_block1) if_block1.m(div5, null);
    			append_dev(div6, t29);
    			append_dev(div6, br1);
    			append_dev(div6, t30);
    			append_dev(div6, t31);
    			append_dev(div6, t32);
    			if (if_block2) if_block2.m(div6, null);
    			append_dev(div6, t33);
    			append_dev(div9, t34);
    			append_dev(div9, div8);
    			append_dev(div8, div7);
    			mount_component(map1_1, div7, null);
    			append_dev(div8, t35);
    			insert_dev(target, t36, anchor);
    			insert_dev(target, section2, anchor);
    			append_dev(section2, div10);
    			append_dev(div10, h20);
    			append_dev(div10, t38);
    			append_dev(div10, p5);
    			append_dev(div10, t40);
    			append_dev(div10, h21);
    			append_dev(div10, t42);
    			append_dev(div10, ul);
    			append_dev(ul, li0);
    			append_dev(ul, t44);
    			append_dev(ul, li1);
    			append_dev(ul, t46);
    			append_dev(ul, li2);
    			append_dev(ul, t48);
    			append_dev(ul, li3);
    			append_dev(ul, t50);
    			append_dev(ul, li4);
    			append_dev(ul, t52);
    			append_dev(ul, li5);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(select, "change", /*select_change_handler*/ ctx[18]),
    					listen_dev(input0, "change", /*input0_change_handler*/ ctx[19]),
    					listen_dev(input1, "change", /*input1_change_handler*/ ctx[20]),
    					listen_dev(input2, "change", /*input2_change_handler*/ ctx[21])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*baseMaps*/ 131072) {
    				each_value = /*baseMaps*/ ctx[17];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty[0] & /*baseMap, baseMaps*/ 139264) {
    				select_option(select, /*baseMap*/ ctx[13]);
    			}

    			if (dirty[0] & /*showSources*/ 1024) {
    				input0.checked = /*showSources*/ ctx[10];
    			}

    			if (dirty[0] & /*showLayers*/ 2048) {
    				input1.checked = /*showLayers*/ ctx[11];
    			}

    			if (dirty[0] & /*visLayers*/ 4096) {
    				input2.checked = /*visLayers*/ ctx[12];
    			}

    			const map0_changes = {};
    			if (dirty[0] & /*baseMap*/ 8192) map0_changes.style = /*baseMap*/ ctx[13].path;

    			if (!updating_map && dirty[0] & /*map1*/ 1) {
    				updating_map = true;
    				map0_changes.map = /*map1*/ ctx[0];
    				add_flush_callback(() => updating_map = false);
    			}

    			if (!updating_zoom && dirty[0] & /*zoom*/ 64) {
    				updating_zoom = true;
    				map0_changes.zoom = /*zoom*/ ctx[6];
    				add_flush_callback(() => updating_zoom = false);
    			}

    			if (!updating_center && dirty[0] & /*center*/ 128) {
    				updating_center = true;
    				map0_changes.center = /*center*/ ctx[7];
    				add_flush_callback(() => updating_center = false);
    			}

    			map0.$set(map0_changes);
    			if ((!current || dirty[0] & /*zoom*/ 64) && t20_value !== (t20_value = (/*zoom*/ ctx[6] ? /*zoom*/ ctx[6].toFixed(1) : '') + "")) set_data_dev(t20, t20_value);

    			if ((!current || dirty[0] & /*center*/ 128) && t22_value !== (t22_value = (/*center*/ ctx[7].lng
    			? /*center*/ ctx[7].lng.toFixed(1)
    			: '') + "")) set_data_dev(t22, t22_value);

    			if ((!current || dirty[0] & /*center*/ 128) && t24_value !== (t24_value = (/*center*/ ctx[7].lat
    			? /*center*/ ctx[7].lat.toFixed(1)
    			: '') + "")) set_data_dev(t24, t24_value);

    			if (/*geojson*/ ctx[5] && /*data*/ ctx[4].pcon) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*geojson, data*/ 48) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_6(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div3, null);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*geojson*/ ctx[5] && /*data*/ ctx[4].pcon) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*geojson, data*/ 48) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_3(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div5, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if ((!current || dirty[0] & /*hovered*/ 256) && t31_value !== (t31_value = (/*hovered*/ ctx[8] ? /*hovered*/ ctx[8] : '') + "")) set_data_dev(t31, t31_value);

    			if (/*selected*/ ctx[9]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_2(ctx);
    					if_block2.c();
    					if_block2.m(div6, t33);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			const map1_1_changes = {};
    			if (dirty[0] & /*baseMap*/ 8192) map1_1_changes.style = /*baseMap*/ ctx[13].path;

    			if (dirty[0] & /*data, baseMap, visLayers, showLayers, showSources*/ 15376 | dirty[1] & /*$$scope*/ 16) {
    				map1_1_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_map_1 && dirty[0] & /*map4*/ 8) {
    				updating_map_1 = true;
    				map1_1_changes.map = /*map4*/ ctx[3];
    				add_flush_callback(() => updating_map_1 = false);
    			}

    			map1_1.$set(map1_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(map0.$$.fragment, local);
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(map1_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(map0.$$.fragment, local);
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(map1_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section0);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t17);
    			if (detaching) detach_dev(section1);
    			destroy_component(map0);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			destroy_component(map1_1);
    			if (detaching) detach_dev(t36);
    			if (detaching) detach_dev(section2);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const pconData = "./data/salary-pcon10.csv";
    const lsoaData = "./data/imd-lsoa11.csv";

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	const colors = {
    		seq5: [
    			'rgb(234, 236, 177)',
    			'rgb(169, 216, 145)',
    			'rgb(0, 167, 186)',
    			'rgb(0, 78, 166)',
    			'rgb(0, 13, 84)'
    		],
    		div10: [
    			'#67001f',
    			'#b2182b',
    			'#d6604d',
    			'#f4a582',
    			'#fddbc7',
    			'#d1e5f0',
    			'#92c5de',
    			'#4393c3',
    			'#2166ac',
    			'#053061'
    		]
    	};

    	const pconBounds = {
    		url: "./data/pcon10-bounds.json",
    		layer: "PCONreg",
    		code: "AREACD"
    	};

    	const lsoaBounds = {
    		url: "https://cdn.ons.gov.uk/maptiles/administrative/lsoa/v1/boundaries/{z}/{x}/{y}.pbf",
    		layer: "boundaries",
    		code: "AREACD"
    	};

    	const bounds = {
    		uk: [[-9, 49], [2, 61]],
    		ew: [[-6, 49], [2, 56]]
    	};

    	const baseMaps = [
    		{
    			key: "omt",
    			label: "OpenMapTiles",
    			path: "./data/style-ons-light.json"
    		},
    		{
    			key: "osm",
    			label: "OpenStreetMap",
    			path: "./data/style-osm-grey.json"
    		}
    	];

    	// Bindings
    	let map1, map2, map3, map4;

    	// Data
    	let data = {};

    	let geojson;

    	// State
    	let zoom;

    	let center = {};
    	let hovered, selected;
    	let showSources = true;
    	let showLayers = true;
    	let visLayers = true;
    	let baseMap = baseMaps[0];

    	// Get geometry for geojson maps
    	getTopo(pconBounds.url, pconBounds.layer).then(res => $$invalidate(5, geojson = res));

    	// Get data for geojson maps
    	getData(pconData).then(res => {
    		let vals = res.map(d => d.salary).sort((a, b) => a - b);
    		let len = vals.length;

    		let breaks = [
    			vals[0],
    			vals[Math.floor(len * 0.2)],
    			vals[Math.floor(len * 0.4)],
    			vals[Math.floor(len * 0.6)],
    			vals[Math.floor(len * 0.8)],
    			vals[len - 1]
    		];

    		res.forEach(d => {
    			d.color = getColor(d.salary, breaks, colors.seq5);
    		});

    		$$invalidate(4, data.pcon = res, data);
    	});

    	// Get data for vector tiles map
    	getData(lsoaData).then(res => {
    		res.forEach(d => {
    			d.color = colors.div10[+d.income_decile - 1];
    			d.AREACD = d.lsoa11cd;
    		});

    		$$invalidate(4, data.lsoa = res, data);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		baseMap = select_value(this);
    		$$invalidate(13, baseMap);
    		$$invalidate(17, baseMaps);
    	}

    	function input0_change_handler() {
    		showSources = this.checked;
    		$$invalidate(10, showSources);
    	}

    	function input1_change_handler() {
    		showLayers = this.checked;
    		$$invalidate(11, showLayers);
    	}

    	function input2_change_handler() {
    		visLayers = this.checked;
    		$$invalidate(12, visLayers);
    	}

    	function map0_map_binding(value) {
    		map1 = value;
    		$$invalidate(0, map1);
    	}

    	function map0_zoom_binding(value) {
    		zoom = value;
    		$$invalidate(6, zoom);
    	}

    	function map0_center_binding(value) {
    		center = value;
    		$$invalidate(7, center);
    	}

    	function map_map_binding(value) {
    		map2 = value;
    		$$invalidate(1, map2);
    	}

    	function maplayer0_hovered_binding(value) {
    		hovered = value;
    		$$invalidate(8, hovered);
    	}

    	function maplayer0_selected_binding(value) {
    		selected = value;
    		$$invalidate(9, selected);
    	}

    	function map_map_binding_1(value) {
    		map3 = value;
    		$$invalidate(2, map3);
    	}

    	const click_handler = () => $$invalidate(9, selected = null);

    	function map1_1_map_binding(value) {
    		map4 = value;
    		$$invalidate(3, map4);
    	}

    	$$self.$capture_state = () => ({
    		getData,
    		getColor,
    		getTopo,
    		Map: Map$1,
    		MapSource,
    		MapLayer,
    		MapTooltip,
    		colors,
    		pconData,
    		pconBounds,
    		lsoaData,
    		lsoaBounds,
    		bounds,
    		baseMaps,
    		map1,
    		map2,
    		map3,
    		map4,
    		data,
    		geojson,
    		zoom,
    		center,
    		hovered,
    		selected,
    		showSources,
    		showLayers,
    		visLayers,
    		baseMap
    	});

    	$$self.$inject_state = $$props => {
    		if ('map1' in $$props) $$invalidate(0, map1 = $$props.map1);
    		if ('map2' in $$props) $$invalidate(1, map2 = $$props.map2);
    		if ('map3' in $$props) $$invalidate(2, map3 = $$props.map3);
    		if ('map4' in $$props) $$invalidate(3, map4 = $$props.map4);
    		if ('data' in $$props) $$invalidate(4, data = $$props.data);
    		if ('geojson' in $$props) $$invalidate(5, geojson = $$props.geojson);
    		if ('zoom' in $$props) $$invalidate(6, zoom = $$props.zoom);
    		if ('center' in $$props) $$invalidate(7, center = $$props.center);
    		if ('hovered' in $$props) $$invalidate(8, hovered = $$props.hovered);
    		if ('selected' in $$props) $$invalidate(9, selected = $$props.selected);
    		if ('showSources' in $$props) $$invalidate(10, showSources = $$props.showSources);
    		if ('showLayers' in $$props) $$invalidate(11, showLayers = $$props.showLayers);
    		if ('visLayers' in $$props) $$invalidate(12, visLayers = $$props.visLayers);
    		if ('baseMap' in $$props) $$invalidate(13, baseMap = $$props.baseMap);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		map1,
    		map2,
    		map3,
    		map4,
    		data,
    		geojson,
    		zoom,
    		center,
    		hovered,
    		selected,
    		showSources,
    		showLayers,
    		visLayers,
    		baseMap,
    		pconBounds,
    		lsoaBounds,
    		bounds,
    		baseMaps,
    		select_change_handler,
    		input0_change_handler,
    		input1_change_handler,
    		input2_change_handler,
    		map0_map_binding,
    		map0_zoom_binding,
    		map0_center_binding,
    		map_map_binding,
    		maplayer0_hovered_binding,
    		maplayer0_selected_binding,
    		map_map_binding_1,
    		click_handler,
    		map1_1_map_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {}, null, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var hydrate = false;
    var config = {
    	hydrate: hydrate
    };

    const app = new App({
    	target: document.body,
    	hydrate: config.hydrate
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
