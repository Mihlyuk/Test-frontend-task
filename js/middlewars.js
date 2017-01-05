/**
 * For each element of the array removes a sub-element with the name fieldName
 *
 * @param {Array} array
 * @param {String} fieldName
 *
 * @return {Array}
 */
function removeNesting(array, fieldName) {
    return array.map(function (element) {
        return element[fieldName];
    });
}

/**
 * Sorts the items by date and forms a separate group
 *
 * @param {Array} array
 *
 * @return {[Array]}
 */
function sortByDate(array) {
    var sortArray = [];
    var lastElement = null;

    array.forEach(function (element) {
        if (sortArray.length == 0) {
            sortArray.push([element]);
            lastElement = element;
            return;
        }

        var one = moment(element.created_at).isSame(moment(lastElement.created_at), 'day');
        var two = moment(element.created_at).isSame(moment(lastElement.created_at), 'month');
        var three = moment(element.created_at).isSame(moment(lastElement.created_at), 'year');

        if (one && two && three) {
            sortArray[sortArray.length - 1].push(element);
        } else {
            sortArray.push([element]);
        }

        lastElement = element;
    });

    return sortArray;
}
