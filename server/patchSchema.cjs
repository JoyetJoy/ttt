const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'prisma', 'schema.prisma');
let content = fs.readFileSync(filePath, 'utf-8');

// Add attribute_terms to destinations
content = content.replace(
  'features_image           String?                    @db.Text\n    enable_seo               String?',
  'features_image           String?                    @db.Text\n    attribute_terms          String?                    @db.LongText\n    enable_seo               String?'
);

// Append new models for destination_attributes if they don't exist
if (!content.includes('model destination_attributes {')) {
  const newModels = `
model destination_attributes {
  id                                   BigInt                                 @id @default(autoincrement()) @db.UnsignedBigInt
  name                                 String
  status                               Int                                    @default(1)
  created_at                           DateTime?                              @db.Timestamp(0)
  updated_at                           DateTime?                              @db.Timestamp(0)
  destination_attribute_terms          destination_attribute_terms[]
}

model destination_attribute_terms {
  id                                        BigInt                                      @id @default(autoincrement()) @db.UnsignedBigInt
  attribute_id                              BigInt                                      @db.UnsignedBigInt
  name                                      String
  status                                    Int                                         @default(1)
  created_at                                DateTime?                                   @db.Timestamp(0)
  updated_at                                DateTime?                                   @db.Timestamp(0)
  destination_attributes                    destination_attributes                      @relation(fields: [attribute_id], references: [id], onDelete: Cascade, onUpdate: NoAction, map: "destination_attribute_terms_attribute_id_foreign")

  @@index([attribute_id], map: "destination_attribute_terms_attribute_id_foreign")
}
`;
  content += newModels;
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Schema updated successfully!');
