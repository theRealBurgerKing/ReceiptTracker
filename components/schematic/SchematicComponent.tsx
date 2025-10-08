import React from "react";
import { getTemporaryAccessToken } from "@/actions/getTemporaryAccessToken";
import SchematicEmbed from "./SchematicEmbed";


async function SchematicComponent({componentId}:{componentId?:string}) {
    //const {registerComponent} = useSchematic();
    if (!componentId) {
        return null;
    }

    const accessToken = await getTemporaryAccessToken();
    if (!accessToken) {
        throw new Error("Failed to get access token");
    }

    return <SchematicEmbed accessToken={accessToken} componentId={componentId} />;
}

export default SchematicComponent;