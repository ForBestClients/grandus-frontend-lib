import Link from "next/link";
import Image from "grandus-lib/components-atomic/image/Image";
import { Button, Row, Col } from "antd";
import { getCategoryLinkAttributes } from "grandus-lib/hooks/useFilter";
import { isEmpty, map } from "lodash";

export const Title = ({ title, subtitle }) => {
  if (!title) {
    return "";
  }
  return (
    <Col xs={24}>
      <h1>
        {title}
        {subtitle ? <small> | {subtitle}</small> : ""}
      </h1>
    </Col>
  );
};

export const CoverPhoto = ({ photo }) => {
  if (!photo?.path) {
    return "";
  }
  return (
    <Col xs={24}>
      <div>
        <Image
          className={"image"}
          photo={photo}
          size={"1200x180__cropped"}
          type={"jpg"}
          useNextImage={true}
        />
      </div>
    </Col>
  );
};

export const Description = ({ description }) => {
  return (
    <Col xs={24}>
      <div
        dangerouslySetInnerHTML={{
          __html: description,
        }}
      />
    </Col>
  );
};

export const SubCategories = ({ subCategories }) => {
  if (isEmpty(subCategories)) {
    return "";
  }
  return (
    <Row gutter={[15, 15]}>
      {map(subCategories, (subCategory, index) => {
        const { id, name, urlName, mainPhoto = null } = subCategory;
        return (
          <Col key={`subcategory-${id}-${index}`}>
            <Link {...getCategoryLinkAttributes(urlName)}>
              <Button
                icon={
                  <Image
                    photo={mainPhoto}
                    size={"18x18"}
                    type={"png"}
                    useNextImage={true}
                  />
                }
              >
                {name}
              </Button>
            </Link>
          </Col>
        );
      })}
    </Row>
  );
};

const Parameters = ({}) => {
  return <span>a</span>;
};
