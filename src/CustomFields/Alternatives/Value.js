const Value = ({value, options, separator= "; "}) => {

  if (!value) {
    return null;
  }

  if (typeof value !== "object" && !(value instanceof Array)) {
    return value;
  }

  if (value.length) {
    return value.map((item, index) => {
      if (item.id && (options instanceof Array)) {
        const option = options.find(option => option.id === item.id);
        if (option != undefined && option.name) {
          return (index?separator:"") + option.name;
        }
        return (index?separator:"") + item.id;
      }

      if (item.id) {
        return item.id;
      }

      if (typeof item !== "object") {
        return item;
      }

      return null;
    });
  }

  if (value.id && (options instanceof Array)) {
    const option = options.find(option => option.id === value.id);
    if (option != undefined && option.label) {
      return option.label;
    }
    return value.id;
  }

  return null;
};

export default Value;