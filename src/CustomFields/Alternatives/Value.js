const Value = ({value, options, separator= "; "}) => {

  if (!value) {
    return null;
  }

  if (typeof value !== "object") {
    return value;
  }

  if (value.length) {
    return value.map((item, index) => {
      if (item.id && (options instanceof Array)) {
        const option = options.find(option => option.id === item.id);
        if (option && option.name) {
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
    if (option && option.name) {
      return option.name;
    }
    return value.id;
  }

  return null;
};

export default Value;