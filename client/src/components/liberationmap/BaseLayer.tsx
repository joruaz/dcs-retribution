import React from "react";
import { LayersControl } from "react-leaflet";
import { useSelector } from "react-redux";
import { selectActiveBaseMap } from "../../api/mapSlice";

interface BaseLayerProps {
  name: string;
  children: React.ReactNode;
}

export const BaseLayer: React.FC<BaseLayerProps> = ({ name, children }) => {
  const activeBaseMap = useSelector(selectActiveBaseMap);

  return (
    <LayersControl.BaseLayer name={name} checked={activeBaseMap === name}>
      {children}
    </LayersControl.BaseLayer>
  );
};