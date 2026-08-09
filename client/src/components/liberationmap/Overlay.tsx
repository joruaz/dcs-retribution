import React from "react";
import { LayersControl } from "react-leaflet";
import { useSelector } from "react-redux";
import { selectOverlayChecked } from "../../api/mapSlice";

interface OverlayProps {
  name: string;
  defaultChecked?: boolean;
  children: React.ReactNode;
}

export const Overlay: React.FC<OverlayProps> = ({
  name,
  defaultChecked = false,
  children,
}) => {
  const isChecked = useSelector(selectOverlayChecked(name, defaultChecked));

  return (
    <LayersControl.Overlay name={name} checked={isChecked}>
      {children}
    </LayersControl.Overlay>
  );
};