var fs = require("fs");
var Path = require('path');
var jsdom = require("jsdom");
var {
    JSDOM
} = jsdom;

/**
 * 设置样式
 * @param {*} node 
 * @param {*} styleString 
 */
var setStyle = function (node, styleString) {
    const sList = styleString.split(';');
    sList.forEach((sty) => {
        if (sty.trim() === '') return;
        const _styArr = sty.split(':');
        const _styName = _styArr[0].trim(),
            _styValue = _styArr[1].trim();
        _styName !== '' && (node.style[_styName] = _styValue);
    });
}

/**
 * 设置class名
 * @param {*} node 
 * @param {*} classNames 
 */
var setClass = function (node, classNames) {
    const clsList = classNames.split(' ');
    clsList.forEach((cls) => {
        let _cls = cls.trim();
        _cls !== '' && node.classList.add(_cls);
    });
}

/**
 * 设置节点属性
 * @param {*} node 
 * @param {*} name 
 * @param {*} value 
 */
var setAttribute = function (node, name, value) {
    node && node.setAttribute(name, value);
}

/**
 * 设置组件参数
 */
var setCompAttrs = function (node, params) {
    if (!node) return;
    for (let i = 0; i < params.length; i++) {
        const param = params[i];
        const name = param.name,
            value = param.value;
        if (name === 'class') {
            setClass(node, value);
        } else if (name === 'style') {
            setStyle(node, value);
        } else {
            // 设置其他属性
            setAttribute(node, name, value);
        }

    }
}

var html_decode = function (str) {
    var s = "";
    if (str.length == 0) return "";
    s = str.replace(/&amp;/g, "&");
    s = s.replace(/&lt;/g, "<");
    s = s.replace(/&gt;/g, ">");
    s = s.replace(/&nbsp;/g, " ");
    s = s.replace(/&#39;/g, "\'");
    s = s.replace(/&quot;/g, "\"");
    s = s.replace(/<br\/>/g, "\n");
    return s;
}

/**
 * 寻找dom节点，如果没找到继续往后面找
 * @param {*} dom 
 */
var getDomElement = function (dom) {
    if (dom && dom.nodeType === 1) {
        return dom;
    } else {
        return getDomElement(dom.nextSibling);
    }
}

/**
 * 获取dom片段内的插槽
 * @param {*} parentNode 根节点
 * @param {*} slotName  插槽名
 */
var getSlot = function (parentNode, slotName) {
    if (slotName) {
        return parentNode.querySelector(`slot[name="${slotName||''}"]`)
    } else {
        return parentNode.querySelector(`slot:not([name])`);
    }
}
/**
 * 替换插槽
 * @param {*} parentNode  父节点，要插入的片段内根节点
 * @param {*} node 当前节点
 * @param {*} slotName 插槽名
 */
var replaceSlot = function (parentNode, node, slotName) {
    const slot = getSlot(parentNode, slotName);
    slot && slot.parentNode.replaceChild(node, slot);
}

/**
 * 替换默认插槽
 * @param {*} parentNode   父节点，要插入的片段内根节点
 * @param {*} nodes 要插入的节点列表
 */
var replaceDefaultSlot = function (parentNode, nodes) {
    const slot = getSlot(parentNode);
    const slotParent = slot && slot.parentNode || null;
    slotParent && nodes.forEach(function (node) {
        slotParent.insertBefore(node, slot);
    });
    removeNode(slotParent, slot); //移除默认插槽
}

/**
 * 移除子节点
 * @param {*} parent 
 * @param {*} node 
 */
var removeNode = function (parent, node) {
    parent && parent.removeChild(node);
}
var compileChildren = function (dom) {
    //获取所有组件节点
    const comps = dom.querySelectorAll('template[__comp__]');
    if (comps && comps.length) {
        comps.forEach((comp) => {
            const root = comp.content; //当前组件的根节点
            const params = comp.attributes; //组件参数
            const content = getDomElement(root.firstChild); //组件根节点
            removeNode(root, content); //把组件移除再操作
            //设置组件的属性
            setCompAttrs(content, params);

            // 遍历子节点，寻找有插槽名的子组件，放入对应插槽
            const slotComps = root.querySelectorAll('[slot]')
            slotComps.forEach(function (itemComp) {
                const slotName = itemComp.getAttribute('slot');
                removeNode(itemComp.parentNode, itemComp); //当前节点先移除
                replaceSlot(content, itemComp, slotName); //再添加到目标位置
            });

            //剩下的都是默认组件，放入默认插槽内
            replaceDefaultSlot(content, root.childNodes);
            // content挪到外层
            const parentNode = comp.parentNode;
            parentNode.insertBefore(content, comp);
            //移除template节点
            removeNode(parentNode, comp);
            // 递归处理子节点
            compileChildren(content);
        });
    }

}

var run = function (html, callback) {
    const dom = new JSDOM(html);
    const win = dom.window;
    const doc = win.document;
    compileChildren(doc);
    callback && callback(dom.serialize());
}

exports.run = run;