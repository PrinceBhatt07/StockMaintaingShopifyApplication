import { Toast, Modal, TextField } from "@shopify/polaris";
import { useState, useCallback } from "react";
import { useAuthenticatedFetch } from "../hooks";
import { API_URL } from "../utils/apiUrls";

export default function NotesModal({
  notesModalActive,
  handleNotesModalChange,
  note,
  id,
  getRequestedProducts,
}) {
  const [notes, setNotes] = useState(note);
  const [toastActive, setToastActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const toggleActive = useCallback(
    () => setToastActive((toastActive) => !toastActive),
    []
  );
  const fetch = useAuthenticatedFetch();
  const handleNotesChange = useCallback((newValue) => {
    setNotes(newValue);
    setErrorMsg(""), [];
  });
  const Validation = () => {
    if (notes === "" || notes === null) {
      return "Please enter Notes";
    } else {
      return "Ok";
    }
  };
  const editNotes = async () => {
    let validated = Validation();
    if (validated != "Ok") {
      setIsError(true);
      setErrorMsg(validated);
    } else {
      setIsError(false);
      setIsLoading(true);
      try {
        const response = await fetch(API_URL.editNotes, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            notes: notes,
            id: id,
          }),
        });
        const data = await response.json();

        setIsLoading(false);
        if (data.success == "true") {
          toggleActive();
          setTimeout(() => {
            getRequestedProducts();
          }, 1500);
          setTimeout(() => {
            handleNotesModalChange();
          }, 1000);
        }
      } catch (err) {
        setIsLoading(false);
      }
    }
  };

  return (
    <Modal
      open={notesModalActive}
      onClose={handleNotesModalChange}
      title="Notes"
      primaryAction={{
        content: "Edit",
        onAction: editNotes,
        loading: isLoading,
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: handleNotesModalChange,
        },
      ]}
    >
      <Modal.Section>
        <TextField
          labelHidden
          placeholder="NO NOTES"
          label="Notes"
          value={notes}
          onChange={handleNotesChange}
          multiline={4}
          autoComplete="off"
        />
        {isError && (
          <div
            style={{
              display: "flex",
              alignContent: "center",
              color: "red",
            }}
          >
            {errorMsg}
          </div>
        )}
      </Modal.Section>
      {toastActive && (
        <Toast
          content={`Notes Edited Successfully`}
          onDismiss={toggleActive}
          duration={2000}
        />
      )}
    </Modal>
  );
}
