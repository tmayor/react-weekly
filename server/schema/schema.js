import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
} from '../../node_modules/graphql';

import pythonShell from 'python-shell';
import fs from 'fs';
import mongoose from 'mongoose';
import subscriber from '../models/subscriber';

const store = {};

const runPythonScript = () =>
  new Promise((resolve, reject) => {
    const options = {
      scriptPath: '/Users/myMac/Developer/works-in-progress/react-weekly/server/schema',
    };
    pythonShell.run('medium-api.py', options, (err, results) => {
      if (err) reject(err);
      resolve(results);
    });
  });

const loadPosts = () => new Promise((resolve, reject) => {
  runPythonScript().then(() => {
    fs.readFileSync('./posts.json', 'utf-8', (err, contents) => {
      if (err) {
        reject(err);
      }
      resolve(contents);
    });
  });
});

const parseTag = (tag) => ({
  name: tag.name,
  slug: tag.slug,
});

const parseTags = (tags) => {
  const newTags = [];
  for (const tag of tags) {
    newTags.push(parseTag(tag));
  }
  return newTags;
};

const parsePosts = (posts) => {
  console.log(posts);
};

const TagType = new GraphQLObjectType({
  name: 'Tag',
  fields: () => ({
    slug: { type: GraphQLString },
    name: { type: GraphQLString },
  }),
});

const RecommendationType = new GraphQLObjectType({
  name: 'Recommendation',
  fields: () => ({
    name: { type: GraphQLString },
    username: { type: GraphQLString },
  }),
});

const PostType = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: { type: GraphQLString },
    title: { type: GraphQLString },
    snippet: { type: GraphQLString },
    recommendations: { type: new GraphQLList(RecommendationType) },
    tags: { type: new GraphQLList(TagType) },
    uniqueSlug: { type: GraphQLString },
    image: { type: GraphQLString },
  }),
});

const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    posts: {
      type: new GraphQLList(PostType),
      resolve: () => loadPosts().then(posts => parsePosts(posts)),
    },
  }),
});

export default new GraphQLSchema({
  query: QueryType,
});
