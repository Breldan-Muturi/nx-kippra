'use client';
import { FunnelDatum, ResponsiveFunnel } from '@nivo/funnel';

const Funnel = ({ data }: { data: FunnelDatum[] }) => (
  <ResponsiveFunnel
    data={data}
    // margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
    shapeBlending={0.6}
    colors={{ scheme: 'yellow_green' }}
    borderWidth={20}
    labelColor={{
      from: 'color',
      modifiers: [['darker', 3]],
    }}
    beforeSeparatorLength={16}
    beforeSeparatorOffset={20}
    afterSeparatorLength={16}
    afterSeparatorOffset={20}
    currentPartSizeExtension={10}
    currentBorderWidth={40}
    motionConfig="gentle"
  />
);

export default Funnel;
