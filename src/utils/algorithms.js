
export const pagingSkipValue = (page, itemsPerPage) => {
  if (!page || !itemsPerPage) {
    return 0
  }
  if (page < 1 || itemsPerPage < 1) {
    return 0
  }
  return (page - 1) * itemsPerPage
}
