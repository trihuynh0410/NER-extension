from flask import Flask, request, jsonify
import pycrfsuite
import pickle
from flask_cors import CORS
import regex
import re
from underthesea import pos_tag
import os
def tokenize_and_tag(sentence):

    return pos_tag(sentence)

NER_MODEL = pycrfsuite.Tagger()
NER_MODEL.open('./crf_model_CRF.pkl')

app = Flask(__name__)
CORS(app)
def extract_features(sentence, index):
    word, pos = sentence[index]

    features = {
        'bias': 1.0,
        'word': word,
        'word[-3:]': word[-3:],
        'word[-2:]': word[-2:],
        'word[:3]': word[:3],
        'word[:2]': word[:2],
        'word.isdigit()': word.isdigit(),
        'word.istitle()': word.istitle(),
        'word.isupper()': word.isupper(),
    }

    features['postag'] = pos
    window_size = 3
    
    for i in range(1, window_size + 1):
        if index - i >= 0:
            prev_word, prev_pos = sentence[index - i]
            features[f'-{i}:word'] = prev_word
            features[f'-{i}:postag'] = prev_pos
        if index + i < len(sentence):
            next_word, next_pos = sentence[index + i]
            features[f'+{i}:word'] = next_word
            features[f'-{i}:postag'] = next_pos
    return features


@app.route('/')
def index():
    return "Welcome to the NER server!"
@app.route('/extract_entities', methods=['POST'])
def extract_entities():
    content = request.json['content']

    # Tokenize sentences using underthesea
    sentences = re.split(r'(?<=[.!?;,:-])\s+', content)
    tokenized_sentences = [[word for word in tokenize_and_tag(sentence) if not re.match(r'[.!?;,:\-+()]|\d+', word[0])] for sentence in sentences]

    entities = []
    for words in tokenized_sentences:
        features = [extract_features(words, i) for i in range(len(words))if words[i][0]]
        labels = NER_MODEL.tag(features)
        entities.append(list(zip(words, labels)))
    print(entities)

    return jsonify(entities)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)




