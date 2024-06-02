// function getNewIndex(originalIndex: number, length: number, offset: number): number | null {
//     // Check if the original index is one of the indices we care about, considering 1-based indexing
//     if ((originalIndex) % offset === 0 || originalIndex === 1) {
//         // Calculate the new index in the sequence of items we care about
//         return Math.floor((originalIndex - 1) / offset) + 1;
//     } else {
//         // If the original index is not in the sequence we care about, return null
//         return null;
//     }
// }
//

function getNewIndex(originalIndex: number, offset: number): number | null {
    // Check if the original index is one of the indices we care about, considering 1-based indexing
    if (originalIndex === 1 || (originalIndex - 1) % offset === 0) {
        // Calculate the new index in the sequence of items we care about
        return Math.floor((originalIndex - 1) / offset) + 1;
    } else {
        // If the original index is not in the sequence we care about, return null
        return null;
    }
}

// Example usage
const offset = 2;

// Test with some indices
const testIndices = [1, 2,3,4,5,6,7,8,9,10,11, 12,13,14,15,16,17, 18, 24];
testIndices.forEach(originalIndex => {
    const newIndex = getNewIndex(originalIndex, offset);
    if (newIndex !== null) {
        console.log(`Original index: ${originalIndex}, New index: ${newIndex}`);
    } else {
        console.log(`Original index: ${originalIndex} is not one of the indices we care about`);
    }
});
