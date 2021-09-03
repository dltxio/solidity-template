export const getRevertMessage = (error) => {
  if (typeof error !== "string") error = error.message;
  const prefix = "VM Exception while processing transaction: revert ";
  const suffix = "\n";
  error = error.substring(error.indexOf(""));
  error = error.substring(
    error.indexOf(prefix) + prefix.length,
    error.indexOf(suffix) > -1 ? error.indexOf(suffix) : error.length
  );
  // Depending on the formatting of the message, it might wrap the
  // revert message in '' and mention "reverted" instead of revert.
  return error.startsWith("ed") && error.endsWith("'")
    ? error.substring(error.indexOf("'") + 1, error.length - 1)
    : error;
};

export const getEventData = (eventName, contract, txResult) => {
  return contract.interface.decodeEventLog(
    eventName,
    txResult.events.find((x) => x.event === eventName).data
  );
};
