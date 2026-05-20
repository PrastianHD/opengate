"use client";

import { useState } from "react";
import AddUpstreamKeyDialog from "./AddUpstreamKeyDialog";

export default function AddKeyButton({ providers }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => setOpen(true)}
      >
        + Add upstream key
      </button>
      <AddUpstreamKeyDialog
        providers={providers}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
