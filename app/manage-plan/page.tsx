import React from "react";
import SchematicComponent from "@/components/schematic/SchematicComponent";

function ManagePlan() {
  return <div>
    <SchematicComponent componentId={process.env.NEXT_PUBLIC_SCHEMATIC_CUSTOMER_PORTAL_COMPONENT_ID!} />
  </div>;
}

export default ManagePlan;