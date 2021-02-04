import { Radio, Typography } from "antd";
import { get } from "lodash";

import Image from "next/image";

const { Paragraph } = Typography;

const BesteronSingleButton = ({ data }) => {
  return (
    <Radio value={get(data, "value")}>
      <Image
        src={`${process.env.NEXT_PUBLIC_IMAGE_HOST}/${get(data, "img")}`}
        alt={get(data, "name")}
        width={80}
        height={37.5}
      />
      <Paragraph ellipsis={{ rows: 1 }} style={{ marginBottom: 0 }}>
        {get(data, "name")}
      </Paragraph>
    </Radio>
  );
};

export default BesteronSingleButton;
