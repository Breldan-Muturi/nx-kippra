"use client"
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'

const MapComponent = () => {
    return (
        <div className="w-full flex justify-center p-3">
            <MapContainer center={[-1.286389, 36.817223]} zoom={13} scrollWheelZoom={false}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[-1.286389, 36.817223]}>
                    <Popup>
                        A pretty CSS3 popup. <br /> Easily customizable.
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    )
}

export default MapComponent