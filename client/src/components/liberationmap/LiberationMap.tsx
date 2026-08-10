import { selectMapCenter, selectActiveBaseMap } from "../../api/mapSlice";
import { useAppSelector } from "../../app/hooks";
import AircraftLayer from "../aircraftlayer";
import AirDefenseRangeLayer from "../airdefenserangelayer";
import EmitterHighlightToggle from "../airdefenserangelayer/EmitterHighlightToggle";
import CombatLayer from "../combatlayer";
import ControlPointsLayer from "../controlpointslayer";
import CullingExclusionZones from "../cullingexclusionzones/CullingExclusionZones";
import FlightPlansLayer from "../flightplanslayer";
import FrontLinesLayer from "../frontlineslayer";
import Iadsnetworklayer from "../iadsnetworklayer";
import NavMeshLayer from "../navmesh/NavMeshLayer";
import LeafletRuler from "../ruler/Ruler";
import SupplyRoutesLayer from "../supplyrouteslayer";
import TerrainZonesLayers from "../terrainzones/TerrainZonesLayers";
import TgosLayer from "../tgoslayer/TgosLayer";
import { CoalitionThreatZones } from "../threatzones";
import { WaypointDebugZonesControls } from "../waypointdebugzones/WaypointDebugZonesControls";
import "./LiberationMap.css";
import { Map } from "leaflet";
import { useEffect, useRef } from "react";
import { BasemapLayer } from "react-esri-leaflet";
import { LayersControl, MapContainer, ScaleControl, TileLayer, LayerGroup } from "react-leaflet";
import { useSelector } from "react-redux";
import { LayerPersistor } from "./LayerPersistor";
import { BaseLayer } from "./BaseLayer"
import { Overlay } from "./Overlay"


export default function LiberationMap() {
  const map = useRef<Map>(null);
  const mapCenter = useAppSelector(selectMapCenter);
  useEffect(() => {
    map.current?.setView(mapCenter, map.current?.getZoom() ?? 8, { animate: true, duration: 1 });
  });
  const activeBaseMap = useSelector(selectActiveBaseMap);
  return (
    <MapContainer zoom={map.current?.getZoom() ?? 8} zoomControl={false} ref={map}>
      <ScaleControl />
      <LeafletRuler />
      <LayerPersistor />
      <LayersControl collapsed={false}>
        <BaseLayer name="Imagery Clarity">
          <BasemapLayer name="ImageryClarity" />
        </BaseLayer>
        <BaseLayer name="Imagery Firefly">
          <BasemapLayer name="ImageryFirefly" />
        </BaseLayer>
        <BaseLayer name="Topographic">
          <BasemapLayer name="Topographic" />
        </BaseLayer>
        <Overlay name="Control points" defaultChecked={true}>
          <ControlPointsLayer />
        </Overlay>
        <Overlay name="Aircraft" defaultChecked={true}>
          <AircraftLayer />
        </Overlay>
        <Overlay name="Active combat" defaultChecked={true}>
          <CombatLayer />
        </Overlay>
        <Overlay name="Air defenses" defaultChecked={true}>
          <TgosLayer categories={["aa"]} />
        </Overlay>
        <Overlay name="LORAD" >
          <TgosLayer categories={["aa"]} task={"LORAD"} />
        </Overlay>
        <Overlay name="MERAD" >
          <TgosLayer categories={["aa"]} task={"MERAD"} />
        </Overlay>
        <Overlay name="SHORAD" >
          <TgosLayer categories={["aa"]} task={"SHORAD"} />
        </Overlay>
        <Overlay name="AAA" >
          <TgosLayer categories={["aa"]} task={"AAA"} />
        </Overlay>
        <Overlay name="Factories" defaultChecked={true}>
          <TgosLayer categories={["factory"]} />
        </Overlay>
        <Overlay name="Ships" defaultChecked={true}>
          <TgosLayer categories={["ship"]} />
        </Overlay>
        <Overlay name="Other ground objects" defaultChecked={true}>
          <TgosLayer categories={["aa", "factory", "ship"]} exclude />
        </Overlay>
        <Overlay name="Supply routes" defaultChecked={true}>
          <SupplyRoutesLayer />
        </Overlay>
        <Overlay name="Front lines" defaultChecked={true}>
          <FrontLinesLayer />
        </Overlay>
        <Overlay name="Enemy SAM threat range" defaultChecked={true}>
          <AirDefenseRangeLayer blue={false} />
        </Overlay>
        <Overlay name="Enemy SAM detection range">
          <AirDefenseRangeLayer blue={false} detection />
        </Overlay>
        <Overlay name="Enemy IADS Network">
          <Iadsnetworklayer blue={false} />
        </Overlay>
        <Overlay name="Allied SAM threat range">
          <AirDefenseRangeLayer blue={true} />
        </Overlay>
        <Overlay name="Allied SAM detection range">
          <AirDefenseRangeLayer blue={true} detection />
        </Overlay>
        <Overlay name="Highlight radar emitter on hover" defaultChecked={true}>
          <EmitterHighlightToggle />
        </Overlay>
        <Overlay name="Allied IADS Network">
          <Iadsnetworklayer blue={true} />
        </Overlay>
        <Overlay name="Selected flight plan">
          <FlightPlansLayer selectedOnly />
        </Overlay>
        <Overlay name="All blue flight plans" defaultChecked={true}>
          <FlightPlansLayer blue={true} />
        </Overlay>
        <Overlay name="All red flight plans">
          <FlightPlansLayer blue={false} />
        </Overlay>
      </LayersControl>
      <LayersControl position="topleft">
        <CoalitionThreatZones blue={true} />
        <CoalitionThreatZones blue={false} />
        <Overlay name="Blue navmesh">
          <NavMeshLayer blue={true} />
        </Overlay>
        <Overlay name="Red navmesh">
          <NavMeshLayer blue={false} />
        </Overlay>
        <TerrainZonesLayers />
        <CullingExclusionZones />
        <WaypointDebugZonesControls />
      </LayersControl>
    </MapContainer>
  );
}
