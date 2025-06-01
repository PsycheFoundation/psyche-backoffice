import * as React from "react";

import { Button } from "../theme/Button";
import { Image } from "../theme/Image";
import { Layout } from "../theme/Layout";
import { Line } from "../theme/Line";
import { Spacing } from "../theme/Spacing";
import { Text } from "../theme/Text";
import { TextArea } from "../theme/TextArea";
import { TextInput } from "../theme/TextInput";

export function PageTestPath() {
  return "/test";
}

export function PageTest() {
  const dummyImageSrc =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAIAAAAC64paAAAAM0lEQVR4nGJ5k3GIATfYoZyBR5YJjxxBMKp5ZGhmfLtcE48012VzWtk8qnlkaAYEAAD//8n5BlS5J1OvAAAAAElFTkSuQmCC";
  const longText =
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.";
  return (
    <>
      <Text h={1} value="UI/Typography Testing" />
      <Text value="Body1) Lorem Ipsum" />
      <Text value="Body2) Lorem Ipsum" />
      <Text h={2} value="H2) Lorem Ipsum" />
      <Text value="Body) Lorem Ipsum" />
      <Text h={3} value="H3) Lorem Ipsum" />
      <Text value="Body) Lorem Ipsum" />
      <Spacing />
      <Text value={longText} />
      <Text h={2} value="H2) Lorem Ipsum" />
      <Text value="Body) Lorem Ipsum" />
      <Text h={3} value="H3) Lorem Ipsum" />
      <Text value="Body) Lorem Ipsum" />
      <Text h={4} value="H4) Lorem Ipsum" />
      <Text value="Body) Lorem Ipsum" />
      <Spacing />
      <Text value="Body) Lorem Ipsum" />
      <Text h={2} value="Components" />
      <Text value="Regular text" />
      <Text h={3} value="Dummy components" />
      <Button text="Button" onClick={() => {}} />
      <Spacing />
      <Layout horizontal centered wraps spacedOuter>
        <Layout spacedInner>
          <Button
            icon="https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png"
            text="Solana"
            onClick={() => {}}
          />
        </Layout>
        <Layout spacedInner>
          <Button
            icon="https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png"
            text="Solana"
            description="Description"
            onClick={() => {}}
          />
        </Layout>
        <Layout spacedInner>
          <Button
            icon="https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png"
            text="Disabled"
          />
        </Layout>
        <Layout spacedInner flexible>
          <Button text="Inside a flexible container" onClick={() => {}} />
        </Layout>
      </Layout>
      <Spacing />
      <Button
        text="Text"
        description="This button will have a delay between click and finished execution"
        onClick={() => {
          return new Promise<void>((res) =>
            setTimeout(() => {
              res();
            }, 500),
          );
        }}
      />
      <Spacing />
      <Layout bordered>
        <Layout horizontal>
          <Layout flexible padded horizontal>
            <Image src={dummyImageSrc} />
            <Spacing />
            <Text value="Cell" />
          </Layout>
          <Line />
          <Layout flexible padded>
            <Text value="Cell" />
          </Layout>
        </Layout>
        <Line />
        <Layout horizontal>
          <Layout flexible padded horizontal>
            <Image src={dummyImageSrc} />
            <Spacing />
            <Text value="Cell" />
          </Layout>
          <Line />
          <Layout flexible padded>
            <Text value="Cell" />
          </Layout>
        </Layout>
        <Line />
        <Layout horizontal>
          <Layout flexible padded horizontal>
            <Image src={dummyImageSrc} />
            <Spacing />
            <Text value="Cell" />
          </Layout>
          <Line />
          <Layout padded>
            <Text value="Cell" />
          </Layout>
        </Layout>
      </Layout>
      <Spacing />
      <Button text="Text" description={longText} onClick={() => {}} />
      <Spacing />
      <TextInput value="Disabled" placeholder="Placeholder" />
      <Spacing />
      <TextInput placeholder="Placeholder" onChange={() => {}} />
      <Text h={3} value="Forms" />
      <Text value={longText} />
      <Text h={4} value="Regular label:" />
      <Layout horizontal centered>
        <Layout flexible>
          <TextInput placeholder="Placeholder" onChange={() => {}} />
        </Layout>
        <Button text="Action1" onClick={() => {}} />
        <Spacing />
        <Button text="Action2" onClick={() => {}} />
      </Layout>
      <Text h={4} value="Regular label:" />
      <Layout horizontal centered>
        <Text value="Side label:" />
        <Spacing />
        <Layout flexible>
          <TextArea value={"Disabled\nMultiline"} placeholder="Placeholder" />
        </Layout>
        <Spacing />
        <Layout flexible>
          <TextArea
            placeholder={"Placeholder\nMultiline"}
            onChange={() => {}}
          />
        </Layout>
      </Layout>
    </>
  );
}
