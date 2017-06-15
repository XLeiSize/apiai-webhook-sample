class Utils {
  constructor(){

  }

  slugify( string ){
    return string
          .toString()
          .trim()
          .toLowerCase()
          .replace(/[\u00C0-\u00C5]/ig,'a')
          .replace(/[\u00C8-\u00CB]/ig,'e')
          .replace(/[\u00CC-\u00CF]/ig,'i')
          .replace(/[\u00D2-\u00D6]/ig,'o')
          .replace(/[\u00D9-\u00DC]/ig,'u')
          .replace(/\s+/g, "-")
          .replace(/[^\w\-]+/g, "")
          .replace(/\-\-+/g, "-")
          .replace(/^-+/, "")
          .replace(/-+$/, "");
          text
  }

  similarity(s1, s2) {
    let longer = s1;
    let shorter = s2;
    if (s1.length < s2.length) {
      longer = s2;
      shorter = s1;
    }
    let longerLength = longer.length;
    if (longerLength == 0) {
      return 1.0;
    }
    return (longerLength - this.editDistance(longer, shorter)) / parseFloat(longerLength);
  }


  editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    let costs = new Array();
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i == 0)
          costs[j] = j;
        else {
          if (j > 0) {
            let newValue = costs[j - 1];
            if (s1.charAt(i - 1) != s2.charAt(j - 1))
              newValue = Math.min(Math.min(newValue, lastValue),
              costs[j]) + 1;
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0)
        costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

  reflect(promise){
    return promise
      .then(data => {
        return {data: data, status: "resolved"}
      })
      .catch(error => {
        return {error: error, status: "rejected"}
      });
  }

  parseJSON (json) {
    let parsed

    try {
      parsed = JSON.parse(json)
    } catch (e) {
      // Oh well, but whatever...
      return undefined
    }

    return parsed // Could be undefined!
  }

}

module.exports = new Utils();
