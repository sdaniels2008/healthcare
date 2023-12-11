import { createFilterOptions } from "@mui/material";
import useControlled from "@mui/utils/useControlled";
import { useCallback, useMemo, useRef } from "react";
import usePromise from "./usePromise";
/**
 * Wrapper for free solo values.
 *
 * FreeSoloNode is always a leaf node.
 *
 */
export class FreeSoloNode extends String {
  constructor(freeSoloValue, parent = null) {
    super(freeSoloValue);
    this.parent = parent;
  }
}
/**
 * @internal
 * @ignore
 */
/* eslint-disable */

export var NodeType;
(function (NodeType) {
  NodeType[(NodeType["LEAF"] = 0)] = "LEAF";
  NodeType[(NodeType["DOWN_BRANCH"] = 1)] = "DOWN_BRANCH";
  NodeType[(NodeType["UP_BRANCH"] = 2)] = "UP_BRANCH";
})(NodeType || (NodeType = {}));
const asyncOrAsyncBlock = (
  it
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => {
  return (function getReturn(
    result
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) {
    if (result.done) {
      return result.value;
    } else if (result.value instanceof Promise) {
      return result.value.then((value) => getReturn(it.next(value)));
    } else {
      return getReturn(it.next(result.value));
    }
  })(it.next());
};
/**
 * @internal
 * @ignore
 */
export class InternalOption {
  constructor(node, type, path) {
    this.node = node;
    this.type = type;
    this.path = path;
  }
  toString() {
    return String(this.node);
  }
}
const getPathToNode = (toNode, getParent) => {
  function* it() {
    var _a, _b;
    const path = [];
    let parent =
      (_a = yield toNode instanceof FreeSoloNode
        ? toNode.parent
        : getParent(toNode)) !== null && _a !== void 0
        ? _a
        : null;
    while (parent !== null) {
      path.push(parent);
      parent =
        (_b = yield getParent(parent)) !== null && _b !== void 0 ? _b : null;
    }
    return path;
  }
  return asyncOrAsyncBlock(it());
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const defaultFilterOptions = createFilterOptions();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const defaultGetOptionLabel = (node) => String(node);
const defaultGetOptionDisabled = () => false;
const defaultIsBranchSelectable = () => false;
/**
 * @internal
 * @ignore
 */
export const useTreeSelect = ({
  branch: branchProp,
  branchDelimiter = " > ",
  componentName = "useTreeSelect",
  defaultBranch,
  defaultValue,
  filterOptions: filterOptionsProp = defaultFilterOptions,
  freeSolo,
  getPathLabel: getPathLabelProp,
  getChildren,
  getOptionDisabled: getOptionDisabledProp = defaultGetOptionDisabled,
  getOptionLabel: getOptionLabelProp = defaultGetOptionLabel,
  getParent,
  groupBy: groupByProp,
  inputValue: inputValueProp,
  isBranch: isBranchProp,
  isBranchSelectable = defaultIsBranchSelectable,
  isOptionEqualToValue: isOptionEqualToValueProp,
  multiple,
  onBranchChange,
  onChange: onChangeProp,
  onClose: onCloseProp,
  onHighlightChange: onHighlightChangeProp,
  onInputChange: onInputChangeProp,
  onOpen: onOpenProp,
  open: openProp,
  value: valueProp,
}) => {
  const [inputValue, setInputValue] = useControlled({
    controlled: inputValueProp,
    default: "",
    name: componentName,
    state: "inputValue",
  });
  const [curValue, setValue] = useControlled({
    controlled: valueProp,
    default: multiple && defaultValue === undefined ? [] : defaultValue,
    name: componentName,
    state: "value",
  });
  const [curBranch, setBranch] = useControlled({
    controlled: branchProp,
    default:
      defaultBranch !== null && defaultBranch !== void 0 ? defaultBranch : null,
    name: componentName,
    state: "branch",
  });
  const [open, setOpen] = useControlled({
    controlled: openProp,
    default: false,
    name: componentName,
    state: "open",
  });
  const isBranch = useCallback(
    (node) =>
      (
        isBranchProp ||
        ((node) => {
          const result = getChildren(node);
          if (result instanceof Promise) {
            return result.then((result) => !!result);
          }
          return !!result;
        })
      )(node),
    [getChildren, isBranchProp]
  );
  const pathArg = useMemo(() => {
    if (
      (curBranch !== null && curBranch !== void 0 ? curBranch : null) === null
    ) {
      return [];
    }
    const path = getPathToNode(curBranch, getParent);
    if (path instanceof Promise) {
      return path.then((path) => {
        path.unshift(curBranch);
        return path;
      });
    } else {
      path.unshift(curBranch);
      return path;
    }
  }, [curBranch, getParent]);
  const pathResult = usePromise(pathArg);
  const optionsResult = usePromise(
    useMemo(() => {
      const options = [];
      function* getOpts() {
        const [path, children] = yield (() => {
          const children = getChildren(curBranch);
          if (pathArg instanceof Promise || children instanceof Promise) {
            return Promise.all([pathArg, children]).then(([path, children]) => [
              path,
              children || [],
            ]);
          } else {
            return [pathArg, children || []];
          }
        })();
        if (
          curBranch !== null && curBranch !== void 0 ? curBranch : null !== null
        ) {
          options.push(
            new InternalOption(curBranch, NodeType.UP_BRANCH, path.slice(1))
          );
        }
        options.push(
          ...(yield (() => {
            const options = [];
            function* parseChildNode(childNode) {
              if (yield isBranch(childNode)) {
                options.push(
                  new InternalOption(childNode, NodeType.DOWN_BRANCH, path)
                );
                if (!(yield isBranchSelectable(childNode))) {
                  return;
                }
              }
              options.push(new InternalOption(childNode, NodeType.LEAF, path));
            }
            const promises = [];
            for (const childNode of children) {
              const result = asyncOrAsyncBlock(parseChildNode(childNode));
              if (result instanceof Promise) {
                promises.push(result);
              }
            }
            return promises.length
              ? Promise.all(promises).then(() => options)
              : options;
          })())
        );
        return options.sort(({ type: a }, { type: b }) => {
          if (a === b) {
            return 0;
          } else if (a === NodeType.UP_BRANCH) {
            return -1;
          } else if (b === NodeType.UP_BRANCH) {
            return 1;
          } else if (a === NodeType.DOWN_BRANCH) {
            return -1;
          } else if (b === NodeType.DOWN_BRANCH) {
            return 1;
          }
          return 0; // This should never happen.
        });
      }
      return asyncOrAsyncBlock(getOpts());
    }, [curBranch, getChildren, pathArg, isBranch, isBranchSelectable])
  );
  const valueResult = usePromise(
    useMemo(() => {
      if (
        (curValue !== null && curValue !== void 0 ? curValue : null) === null
      ) {
        return null;
      } else if (multiple) {
        const multiValue = [];
        let hasPromise = false;
        for (const node of curValue) {
          const path = getPathToNode(node, getParent);
          if (path instanceof Promise) {
            hasPromise = true;
            multiValue.push(
              path.then((path) => new InternalOption(node, NodeType.LEAF, path))
            );
          } else {
            multiValue.push(new InternalOption(node, NodeType.LEAF, path));
          }
        }
        if (hasPromise) {
          return Promise.all(multiValue);
        } else {
          return multiValue;
        }
      } else {
        const path = getPathToNode(curValue, getParent);
        return path instanceof Promise
          ? path.then(
              (path) => new InternalOption(curValue, NodeType.LEAF, path)
            )
          : new InternalOption(curValue, NodeType.LEAF, path);
      }
    }, [curValue, getParent, multiple])
  );
  const value = useMemo(() => {
    var _a;
    if (multiple) {
      return (
        valueResult.data ||
        curValue.map((value) => new InternalOption(value, NodeType.LEAF, []))
      );
    } else {
      return (_a = valueResult.data) !== null && _a !== void 0
        ? _a
        : (curValue !== null && curValue !== void 0 ? curValue : null) === null
        ? null
        : new InternalOption(curValue, NodeType.LEAF, []);
    }
  }, [curValue, multiple, valueResult.data]);
  const isOptionEqualToValue = useCallback(
    (option, value) => {
      if (
        option.type === NodeType.UP_BRANCH ||
        option.type === NodeType.DOWN_BRANCH ||
        value.type === NodeType.UP_BRANCH ||
        value.type === NodeType.DOWN_BRANCH
      ) {
        return false;
      }
      /**
       * Handle this case:
       * Add freeSolo call to selectNewValue and `multiple === true`
       * https://github.com/mui/material-ui/blob/f8520c409c6682a75e117947c9104a73e30de5c7/packages/mui-base/src/AutocompleteUnstyled/useAutocomplete.js#L622
       */
      const optionNode =
        multiple && freeSolo && typeof option === "string"
          ? new FreeSoloNode(option, curBranch)
          : option.node;
      if (isOptionEqualToValueProp) {
        return isOptionEqualToValueProp(optionNode, value.node);
      } else if (optionNode instanceof FreeSoloNode) {
        if (value.node instanceof FreeSoloNode) {
          return (
            value.node.toString() === optionNode.toString() &&
            optionNode.parent === value.node.parent
          );
        }
        return false;
      } else if (value.node instanceof FreeSoloNode) {
        return false;
      } else {
        return (
          option.node === value.node &&
          option.path.length === value.path.length &&
          option.path.every((node, index) => node === value.path[index])
        );
      }
    },
    [curBranch, freeSolo, isOptionEqualToValueProp, multiple]
  );
  const getOptionLabel = useCallback(
    (arg) => getOptionLabelProp(arg.node),
    [getOptionLabelProp]
  );
  const options = useMemo(() => {
    if (optionsResult.data) {
      // Determine if "inputValue" should be an "add" free solo option.
      if (
        freeSolo &&
        inputValue &&
        (multiple || !value || getOptionLabel(value) !== inputValue)
      ) {
        const freeSoloOption = new InternalOption(
          new FreeSoloNode(inputValue, curBranch),
          NodeType.LEAF,
          pathResult.data || []
        );
        if (
          (multiple ? value : [value]).every(
            (value) =>
              // NOT the following
              !(
                value &&
                value.node instanceof FreeSoloNode &&
                isOptionEqualToValue(freeSoloOption, value)
              )
          )
        ) {
          return [...optionsResult.data, freeSoloOption];
        }
      }
      return optionsResult.data;
    } else if (curBranch === null) {
      return [];
    } else {
      return [new InternalOption(curBranch, NodeType.UP_BRANCH, [])];
    }
  }, [
    curBranch,
    freeSolo,
    getOptionLabel,
    inputValue,
    isOptionEqualToValue,
    multiple,
    optionsResult.data,
    pathResult.data,
    value,
  ]);
  const getOptionDisabled = useCallback(
    ({ node, type }) => {
      if (type === NodeType.UP_BRANCH || node instanceof FreeSoloNode) {
        return false;
      }
      return getOptionDisabledProp(node);
    },
    [getOptionDisabledProp]
  );
  const getPathLabel = useCallback(
    (to, includeTo) => {
      if (getPathLabelProp) {
        return getPathLabelProp(includeTo ? [to.node, ...to.path] : to.path);
      } else {
        if (!to.path.length && !includeTo) {
          return "";
        }
        const [first, rest] = (() => {
          if (includeTo) {
            return [to.node, to.path];
          }
          return [to.path[0], to.path.slice(1)];
        })();
        return rest.reduce((label, node) => {
          return `${getOptionLabelProp(node)}${branchDelimiter}${label}`;
        }, getOptionLabelProp(first));
      }
    },
    [getPathLabelProp, getOptionLabelProp, branchDelimiter]
  );
  // Will NEVER be called unless groupByProp is defined
  const handleGroupBy = useCallback(
    ({ node, type }) => {
      if (type === NodeType.UP_BRANCH) {
        return "";
      } else {
        // Will never be called unless groupByProp is defined
        return groupByProp(node);
      }
    },
    [groupByProp]
  );
  // handleGroupBy is only assigned to groupBy when groupByProp IS defined
  const groupBy = groupByProp && handleGroupBy;
  const noOptions = useRef(
    !options.length ||
      (options.length === 1 && options[0].type === NodeType.UP_BRANCH)
  );
  const filterOptions = useCallback(
    (options, state) => {
      const {
        upBranch,
        freeSoloOptions,
        branchOptionsMap,
        leafOptionsMap,
        optionKeys,
      } = options.reduce(
        (result, option) => {
          if (option.type === NodeType.UP_BRANCH) {
            result.upBranch = option;
          } else if (option.node instanceof FreeSoloNode) {
            result.freeSoloOptions.push(option);
          } else if (option.type === NodeType.DOWN_BRANCH) {
            result.branchOptionsMap.set(option.node, option);
            result.optionKeys.add(option.node);
          } else {
            result.leafOptionsMap.set(option.node, option);
            result.optionKeys.add(option.node);
          }
          return result;
        },
        {
          upBranch: null,
          freeSoloOptions: [],
          branchOptionsMap: new Map(),
          leafOptionsMap: new Map(),
          optionKeys: new Set(),
        }
      );
      // Prevent a selected value from filtering against branch options
      // from which it does NOT belong.
      if (
        !multiple &&
        value &&
        state.getOptionLabel(value) === state.inputValue &&
        !options.find((option) => isOptionEqualToValue(option, value))
      ) {
        return options;
      }
      const filteredOptions = (() => {
        const [branchOptions, leafOptions] = filterOptionsProp(
          Array.from(optionKeys),
          {
            ...state,
            getOptionLabel: getOptionLabelProp,
          }
        ).reduce(
          (filteredOptions, node) => {
            const branchOption = branchOptionsMap.get(node);
            if (branchOption) {
              filteredOptions[0].push(branchOption);
            }
            const leafOption = leafOptionsMap.get(node);
            if (leafOption) {
              filteredOptions[1].push(leafOption);
            }
            return filteredOptions;
          },
          [[], []]
        );
        // Sort branch options to top
        return [...branchOptions, ...leafOptions];
      })();
      noOptions.current = !filteredOptions.length && !freeSoloOptions.length;
      return upBranch === null
        ? [...filteredOptions, ...freeSoloOptions]
        : [upBranch, ...filteredOptions, ...freeSoloOptions];
    },
    [
      filterOptionsProp,
      getOptionLabelProp,
      isOptionEqualToValue,
      multiple,
      value,
    ]
  );
  const selectedOption = useRef(null);
  const onHighlightChange = useCallback(
    (event, option, reason) => {
      var _a;
      selectedOption.current = option;
      if (onHighlightChangeProp) {
        onHighlightChangeProp(
          event,
          (_a = option === null || option === void 0 ? void 0 : option.node) !==
            null && _a !== void 0
            ? _a
            : null,
          reason
        );
      }
    },
    [onHighlightChangeProp]
  );
  const onInputChange = useCallback(
    (...args) => {
      const [, , reason] = args;
      if (
        selectedOption.current &&
        selectedOption.current.type !== NodeType.LEAF &&
        reason === "reset"
      ) {
        if (
          multiple ||
          (value !== null && value !== void 0 ? value : null) === null
        ) {
          args[1] = "";
        } else {
          args[1] = getOptionLabel(value);
        }
      }
      if (onInputChangeProp) {
        onInputChangeProp(...args);
      }
      const [, newInputValue] = args;
      setInputValue(newInputValue);
    },
    [getOptionLabel, multiple, onInputChangeProp, setInputValue, value]
  );
  const onKeyDown = useCallback(
    (event) => {
      var _a;
      if (
        !selectedOption.current ||
        selectedOption.current.type === NodeType.LEAF ||
        event.which == 229
      ) {
        return;
      } else if (event.key === "ArrowRight") {
        if (selectedOption.current.type === NodeType.DOWN_BRANCH) {
          event.preventDefault();
          // https://github.com/mui/mui-x/issues/1403
          // https://github.com/mui/material-ui/blob/b3645b3fd11dc26a06ea370a41b5bac1026c6792/packages/mui-base/src/AutocompleteUnstyled/useAutocomplete.js#L727
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          event["defaultMuiPrevented"] = true;
          const node = selectedOption.current.node;
          if (onInputChange) {
            onInputChange(event, "", "reset");
          }
          if (onBranchChange) {
            onBranchChange(event, node, "down");
          }
          setBranch(node);
        }
      } else if (event.key === "ArrowLeft") {
        if (selectedOption.current.type === NodeType.UP_BRANCH) {
          event.preventDefault();
          // https://github.com/mui/mui-x/issues/1403
          // https://github.com/mui/material-ui/blob/b3645b3fd11dc26a06ea370a41b5bac1026c6792/packages/mui-base/src/AutocompleteUnstyled/useAutocomplete.js#L727
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          event["defaultMuiPrevented"] = true;
          const node =
            (_a = selectedOption.current.path[0]) !== null && _a !== void 0
              ? _a
              : null;
          if (onInputChange) {
            onInputChange(event, "", "reset");
          }
          if (onBranchChange) {
            onBranchChange(event, node, "up");
          }
          setBranch(node);
        }
      }
    },
    [onBranchChange, onInputChange, setBranch]
  );
  const handleOptionClick = useCallback((branchOption) => {
    selectedOption.current = branchOption;
  }, []);
  const onChange = useCallback(
    (...args) => {
      const handleBranchChange = (event, option) => {
        var _a;
        const isUpBranch = option.type === NodeType.UP_BRANCH;
        if (isUpBranch || option.type === NodeType.DOWN_BRANCH) {
          const node = isUpBranch
            ? (_a = option.path[0]) !== null && _a !== void 0
              ? _a
              : null
            : option.node;
          if (onBranchChange) {
            onBranchChange(event, node, isUpBranch ? "up" : "down");
          }
          setBranch(node);
          return true;
        }
        return false;
      };
      /**
       * Allows for recursive call when `autoSelect` and `freeSolo` are `true` and `reason` is "blur" to determine if auto select is selecting an option or creating a free solo value.
       *
       * @internal
       * @ignore
       * */
      const handleChange = (args, reasonIsBlur) => {
        const [event, , reason] = args;
        if (multiple) {
          switch (reason) {
            case "selectOption": {
              const [, rawValues, , details] = args;
              const [newValue] = rawValues.slice(-1);
              const values = rawValues.map(({ node }) => node);
              // Selected Branch
              if (handleBranchChange(event, newValue)) {
                break;
              }
              if (onChangeProp) {
                onChangeProp(
                  event,
                  values,
                  reasonIsBlur ? "blur" : reason,
                  details
                    ? {
                        ...details,
                        option: newValue.node,
                      }
                    : details
                );
              }
              setValue(values);
              break;
            }
            case "createOption": {
              // make copy of value
              const [, [...rawValues], , details] = args;
              const [freeSoloValue] = rawValues.splice(-1);
              const freeSoloNode = new FreeSoloNode(freeSoloValue, curBranch);
              const values = [
                ...rawValues.map(({ node }) => node),
                freeSoloNode,
              ];
              if (onChangeProp) {
                onChangeProp(
                  event,
                  values,
                  reasonIsBlur ? "blur" : reason,
                  details
                    ? {
                        ...details,
                        option: freeSoloNode,
                      }
                    : details
                );
              }
              setValue(values);
              break;
            }
            case "blur": {
              const [, rawValues, , details] = args;
              const [newValue] = rawValues.slice(-1);
              handleChange(
                [
                  event,
                  args[1],
                  typeof newValue === "string"
                    ? "createOption"
                    : "selectOption",
                  details,
                ],
                true
              );
              break;
            }
            case "removeOption":
            case "clear": {
              const [, rawValues, , details] = args;
              const values = rawValues.map(({ node }) => node);
              if (onChangeProp) {
                onChangeProp(
                  event,
                  values,
                  reason,
                  details
                    ? {
                        ...details,
                        option: details.option.node,
                      }
                    : details
                );
              }
              setValue(values);
              break;
            }
          }
        } else {
          switch (reason) {
            case "selectOption": {
              const [, value, , details] = args;
              // Selected Branch
              if (handleBranchChange(event, value)) {
                break;
              }
              if (onChangeProp) {
                onChangeProp(
                  event,
                  value.node,
                  reasonIsBlur ? "blur" : reason,
                  details
                    ? {
                        ...details,
                        option: value.node,
                      }
                    : details
                );
              }
              setValue(value.node);
              break;
            }
            case "createOption": {
              const [, freeSoloValue, , details] = args;
              const freeSoloNode = new FreeSoloNode(freeSoloValue, curBranch);
              if (onChangeProp) {
                onChangeProp(
                  event,
                  freeSoloNode,
                  reasonIsBlur ? "blur" : reason,
                  details
                    ? {
                        ...details,
                        option: freeSoloNode,
                      }
                    : details
                );
              }
              setValue(freeSoloNode);
              break;
            }
            case "blur": {
              const [, newValue, , details] = args;
              handleChange(
                [
                  event,
                  args[1],
                  typeof newValue === "string"
                    ? "createOption"
                    : "selectOption",
                  details,
                ],
                true
              );
              break;
            }
            case "removeOption": //  Note remove only fires for multiple
            case "clear": {
              const [, , , details] = args;
              if (onChangeProp) {
                onChangeProp(
                  event,
                  null,
                  reasonIsBlur ? "blur" : reason,
                  details
                    ? {
                        ...details,
                        option: details.option.node,
                      }
                    : details
                );
              }
              setValue(null);
              break;
            }
          }
        }
      };
      handleChange(args, false);
    },
    [curBranch, multiple, onBranchChange, onChangeProp, setBranch, setValue]
  );
  const onClose = useCallback(
    (...args) => {
      const [, reason] = args;
      if (
        reason === "selectOption" &&
        selectedOption.current &&
        selectedOption.current.type !== NodeType.LEAF
      ) {
        return;
      }
      if (onCloseProp) {
        onCloseProp(...args);
      }
      setOpen(false);
    },
    [onCloseProp, setOpen]
  );
  const onOpen = useCallback(
    (...args) => {
      if (onOpenProp) {
        onOpenProp(...args);
      }
      setOpen(true);
    },
    [onOpenProp, setOpen]
  );
  const _return = {
    filterOptions,
    getPathLabel,
    getOptionDisabled,
    getOptionLabel,
    groupBy,
    onKeyDown,
    handleOptionClick,
    inputValue,
    isAtRoot: curBranch === null,
    isOptionEqualToValue,
    loadingOptions: pathResult.loading || optionsResult.loading,
    noOptions,
    onChange,
    onClose,
    onHighlightChange,
    onInputChange,
    onOpen,
    open,
    options,
    value: value,
  };
  /**
   * Turn OFF the following warning:
   * https://github.com/mui/material-ui/blob/8f7b7514e64f126f0f2a0ced8dcee252b25c68e9/packages/mui-base/src/AutocompleteUnstyled/useAutocomplete.js#L245
   * Not applicable to Tree Select
   */
  if (process.env.NODE_ENV !== "production") {
    const missingValue = (() => {
      // https://github.com/mui/material-ui/blob/8f7b7514e64f126f0f2a0ced8dcee252b25c68e9/packages/mui-base/src/AutocompleteUnstyled/useAutocomplete.js#L246
      if (value !== null && !freeSolo && _return.options.length > 0) {
        return (multiple ? value : [value]).filter(
          (value2) =>
            !_return.options.some((option) =>
              isOptionEqualToValue(option, value2)
            )
        );
      } else {
        return null;
      }
    })();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    _return.options = useMemo(
      () =>
        (
          missingValue === null || missingValue === void 0
            ? void 0
            : missingValue.length
        )
          ? [..._return.options, ...missingValue]
          : _return.options,
      [_return.options, missingValue]
    );
    const _filterOptions = _return.filterOptions;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    _return.filterOptions = useCallback(
      (options, ...rest) =>
        _filterOptions(
          options.filter(
            (option) =>
              !(missingValue === null || missingValue === void 0
                ? void 0
                : missingValue.includes(option))
          ),
          ...rest
        ),
      [_filterOptions, missingValue]
    );
  }
  return _return;
};
export default useTreeSelect;
