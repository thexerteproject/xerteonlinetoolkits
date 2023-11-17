<?php

class PHPEP
{
  const COMPOUND = 'Compound';
  const IDENTIFIER = 'Identifier';
  const MEMBER_EXP = 'MemberExpression';
  const LITERAL = 'Literal';
  const THIS_EXP = 'ThisExpression';
  const CALL_EXP = 'CallExpression';
  const UNARY_EXP = 'UnaryExpression';
  const BINARY_EXP = 'BinaryExpression';
  const LOGICAL_EXP = 'LogicalExpression';
  const CONDITIONAL_EXP = 'ConditionalExpression';
  const ARRAY_EXP = 'ArrayExpression';


  const PERIOD_CODE = 46; // '.'
  const COMMA_CODE  = 44; // ','
  const SQUOTE_CODE = 39; // single quote
  const DQUOTE_CODE = 34; // double quotes
  const OPAREN_CODE = 40; // (
  const CPAREN_CODE = 41; // )
  const OBRACK_CODE = 91; // [
  const CBRACK_CODE = 93; // ]
  const QUMARK_CODE = 63; // ?
  const SEMCOL_CODE = 59; // ;
  const COLON_CODE  = 58; // :

  private $this_str = 'this';

  public function __construct($expr)
  {
    $this->t = true;

    $this->unary_ops = array(
      '-' => $this->t,
      '!' => $this->t,
      '~' => $this->t,
      '+' => $this->t
    );
    $this->binary_ops = array(
      '||' => 1, '&&' => 2, '|' => 3,  '^' => 4,  '&' => 5,
      '==' => 6, '!=' => 6, '===' => 6, '!==' => 6,
      '<' => 7,  '>' => 7,  '<=' => 7,  '>=' => 7, 
      '<<' =>8,  '>>' => 8, '>>>' => 8,
      '+' => 9, '-' => 9,
      '*' => 10, '/' => 10, '%' => 10
    );


    $this->max_unop_len = $this->getMaxKeyLen($this->unary_ops);
    $this->max_binop_len = $this->getMaxKeyLen($this->binary_ops);

    $this->literals = array(
      'true' => true,
      'false' => false,
      'null' => null,
    );


    $this->expr = $expr;
    $this->index = 0;
    $this->length = strlen($expr);
  }

  public function exec()
  {
    $nodes = array();
    $ch_i = null;
    $node = null;
      
    while ($this->index < $this->length) {
      $ch_i = $this->exprICode($this->index);

      // Expressions can be separated by semicolons, commas, or just inferred without any
      // separators
      if ($ch_i === self::SEMCOL_CODE || $ch_i === self::COMMA_CODE) {
        $this->index++; // ignore separators
      } else {
        // Try to gobble each expression individually
        if(($node = $this->gobbleExpression())) {
          array_push($nodes, $node);
        // If we weren't able to find a binary expression and are out of room, then
        // the expression passed in probably has too much
        } else if($this->index < $this->length) {
          $this->throwError('Unexpected "' . $this->exprI($this->index) . '"', $this->index);
        }
      }
    }

    // If there's only one expression just try returning the expression
    if(sizeof($nodes) === 1) {
      return $nodes[0];
    } else {
      return array(
        'type' => self::COMPOUND,
        'body' => $nodes
      );
    }
  }

  private function charAtFunc ($i) {
    return (!$this->expr || !isset($this->expr[$i])) ? null : $this->expr[$i];
  }
  private function charCodeAtFunc ($i) {
    return (!$this->expr || !isset($this->expr[$i])) ? null : ord($this->expr[$i]);
  }
  private function exprI ($i) {
    return $this->charAtFunc($i);
  }
  private function exprICode ($i) {
    return $this->charCodeAtFunc($i);
  }

  private function throwError ($message, $index)
  {
      $error = new Exception($message . ' at character ' . $index);
      $error->index = $index;
      $error->description = $message;
      throw $error;
  }

  private function getMaxKeyLen ($obj)
  {
    $max_len = 0;
    $len = null;
    foreach ($obj as $key => $val) {
      if (($len = strlen($key)) > $max_len && array_key_exists($key, $obj)) {
        $max_len = $len;
      }
    }
    return $max_len;
  }

  private function binaryPrecedence ($op_val)
  {
    return ($val = $this->binary_ops[$op_val]) ? $val : 0;
  }

  private function createBinaryExpression ($operator, $left, $right)
  {
    $type = ($operator === '||' || $operator === '&&') ? self::LOGICAL_EXP : self::BINARY_EXP;
    return array(
      'type' => $type,
      'operator' => $operator,
      'left' => $left,
      'right' => $right
    );
  }

  private function isDecimalDigit ($ch)
  {
    return ($ch >= 48 && $ch <= 57); // 0...9
  }

  private function isIdentifierStart ($ch)
  {
    return ($ch === 36) || ($ch === 95) || // `$` and `_`
        ($ch >= 65 && $ch <= 90) || // A...Z
        ($ch >= 97 && $ch <= 122); // a...z
  }

  private function isIdentifierPart ($ch)
  {
    return ($ch === 36) || ($ch === 95) || // `$` and `_`
        ($ch >= 65 && $ch <= 90) || // A...Z
        ($ch >= 97 && $ch <= 122) || // a...z
        ($ch >= 48 && $ch <= 57); // 0...9
  }

  private function gobbleSpaces () {
    $ch = $this->exprICode($this->index);
    // space or tab
    while($ch === 32 || $ch === 9) {
      $ch = $this->exprICode(++$this->index);
    }
  }

  private function gobbleExpression () {
    $test = $this->gobbleBinaryExpression();
    $consequent = null;
    $alternate = null;

    $this->gobbleSpaces();
    if($this->exprICode($this->index) === self::QUMARK_CODE) {
      // Ternary expression: test ? consequent : alternate
      $this->index++;
      $consequent = $this->gobbleExpression();
      if(!$consequent) {
        $this->throwError('Expected expression', $this->index);
      }
      $this->gobbleSpaces();
      if($this->exprICode($this->index) === self::COLON_CODE) {
        $this->index++;
        $alternate = $this->gobbleExpression();
        if(!$alternate) {
          $this->throwError('Expected expression', $this->index);
        }
        return array(
          'type' => self::CONDITIONAL_EXP,
          'test' => $test,
          'consequent' => $consequent,
          'alternate' => $alternate
        );
      } else {
        $this->throwError('Expected :', $this->index);
      }
    } else {
      return $test;
    }
  }

  private function gobbleBinaryOp ()
  {
    $this->gobbleSpaces();
    $biop = null;
    $to_check = substr($this->expr, $this->index, $this->max_binop_len);
    $tc_len = strlen($to_check);
    while($tc_len > 0) {
      if(array_key_exists($to_check, $this->binary_ops)) {
        $this->index += $tc_len;
        return $to_check;
      }
      $to_check = substr($to_check, 0, --$tc_len);
    }
    return false;
  }

  private function gobbleBinaryExpression () {
    $ch_i = null;
    $node = null;
    $biop = null;
    $prec = null;
    $stack = null;
    $biop_info = null;
    $left = null;
    $right = null;
    $i = null;

    // First, try to get the leftmost thing
    // Then, check to see if there's a binary operator operating on that leftmost thing
    $left = $this->gobbleToken();
    $biop = $this->gobbleBinaryOp();

    // If there wasn't a binary operator, just return the leftmost node
    if(!$biop) {
      return $left;
    }

    // Otherwise, we need to start a stack to properly place the binary operations in their
    // precedence structure
    $biop_info = array(
      'value' => $biop,
      'prec' => $this->binaryPrecedence($biop)
    );

    $right = $this->gobbleToken();
    if(!$right) {
      $this->throwError("Expected expression after " . $biop, $this->index);
    }
    $stack = array($left, $biop_info, $right);

    // Properly deal with precedence using [recursive descent](http://www.engr.mun.ca/~theo/Misc/exp_parsing.htm)
    while(($biop = $this->gobbleBinaryOp())) {
      $prec = $this->binaryPrecedence($biop);

      if($prec === 0) {
        break;
      }
      $biop_info = array(
        'value' => $biop,
        'prec' => $prec
      );

      // Reduce: make a binary expression from the three topmost entries.
      while ((sizeof($stack) > 2) && ($prec <= $stack[sizeof($stack) - 2]['prec'])) {
        $right = array_pop($stack);
        $biop = array_pop($stack)['value'];
        $left = array_pop($stack);
        $node = $this->createBinaryExpression($biop, $left, $right);
        array_push($stack, $node);
      }

      $node = $this->gobbleToken();
      if(!$node) {
        $this->throwError("Expected expression after " . $biop, $this->index);
      }
      array_push($stack, $biop_info);
      array_push($stack, $node);
    }

    $i = sizeof($stack) - 1;
    $node = $stack[$i];
    while($i > 1) {
      $node = $this->createBinaryExpression($stack[$i - 1]['value'], $stack[$i - 2], $node); 
      $i -= 2;
    }
    return $node;
  }

  // An individual part of a binary expression:
  // e.g. `foo.bar(baz)`, `1`, `"abc"`, `(a % 2)` (because it's in parenthesis)
  private function gobbleToken () {
    $ch = null;
    $to_check = null;
    $tc_len = null;
    
    $this->gobbleSpaces();
    $ch = $this->exprICode($this->index);

    if($this->isDecimalDigit($ch) || $ch === self::PERIOD_CODE) {
      // Char code 46 is a dot `.` which can start off a numeric literal
      return $this->gobbleNumericLiteral();
    } else if($ch === self::SQUOTE_CODE || $ch === self::DQUOTE_CODE) {
      // Single or double quotes
      return $this->gobbleStringLiteral();
    } else if($this->isIdentifierStart($ch) || $ch === self::OPAREN_CODE) { // open parenthesis
      // `foo`, `bar.baz`
      return $this->gobbleVariable();
    } else if ($ch === self::OBRACK_CODE) {
      return $this->gobbleArray();
    } else {
      $to_check = substr($this->expr, $this->index, $this->max_unop_len);
      $tc_len = strlen($to_check);
      while($tc_len > 0) {
        if(array_key_exists($to_check, $this->unary_ops)) {
          $this->index += $tc_len;
          return array(
            'type' => self::UNARY_EXP,
            'operator' => $to_check,
            'argument' => $this->gobbleToken(),
            'prefix' => true
          );
        }
        $to_check = substr($to_check, 0, --$tc_len);
      }
      
      return false;
    }
  }

  private function gobbleNumericLiteral () {
    $number = '';
    $ch = null;
    $chCode = null;
    while($this->isDecimalDigit($this->exprICode($this->index))) {
      $number .= $this->exprI($this->index++);
    }

    if($this->exprICode($this->index) === self::PERIOD_CODE) { // can start with a decimal marker
      $number .= $this->exprI($this->index++);

      while($this->isDecimalDigit($this->exprICode($this->index))) {
        $number .= $this->exprI($this->index++);
      }
    }
    
    $ch = $this->exprI($this->index);
    if($ch === 'e' || $ch === 'E') { // exponent marker
      $number .= $this->exprI($this->index++);
      $ch = exprI($this->index);
      if($ch === '+' || $ch === '-') { // exponent sign
        $number .= $this->exprI($this->index++);
      }
      while($this->isDecimalDigit($this->exprICode($this->index))) { //exponent itself
        $number .= $this->exprI($this->index++);
      }
      if(!$this->isDecimalDigit($this->exprICode($this->index-1)) ) {
        $this->throwError('Expected exponent (' . $number . $this->exprI($this->index) . ')', $this->index);
      }
    }
    

    $chCode = $this->exprICode($this->index);
    // Check to make sure this isn't a variable name that start with a number (123abc)
    if($this->isIdentifierStart($chCode)) {
      $this->throwError('Variable names cannot start with a number (' .
            $number . $this->exprI($this->index) . ')', $this->index);
    } else if($chCode === self::PERIOD_CODE) {
      $this->throwError('Unexpected period', $this->index);
    }

    return array(
      'type' => self::LITERAL,
      'value' => floatval($number),
      'raw' => $number
    );
  }

  // Parses a string literal, staring with single or double quotes with basic support for escape codes
  // e.g. `"hello world"`, `'this is\nJSEP'`
  private function gobbleStringLiteral () {
    $str = '';
    $quote = $this->exprI($this->index++);
    $closed = false;
    $ch = null;

    while($this->index < $this->length) {
      $ch = $this->exprI($this->index++);
      if($ch === $quote) {
        $closed = true;
        break;
      } else if($ch === '\\') {
        // Check for all of the common escape codes
        $ch = $this->exprI($this->index++);
        switch($ch) {
          case 'n': $str .= '\n'; break;
          case 'r': $str .= '\r'; break;
          case 't': $str .= '\t'; break;
          case 'b': $str .= '\b'; break;
          case 'f': $str .= '\f'; break;
          case 'v': $str .= '\x0B'; break;
          case '\\': $str .= '\\'; break;
        }
      } else {
        $str .= $ch;
      }
    }

    if(!$closed) {
      $this->throwError('Unclosed quote after "'.$str.'"', $this->index);
    }

    return array(
      'type' => self::LITERAL,
      'value' => $str,
      'raw' => $quote . $str . $quote
    );
  }

  // Gobbles only identifiers
  // e.g.: `foo`, `_value`, `$x1`
  // Also, this function checks if that identifier is a literal:
  // (e.g. `true`, `false`, `null`) or `this`
  private function gobbleIdentifier () {
    $ch = $this->exprICode($this->index);
    $start = $this->index;
    $identifier = null;

    if ($this->isIdentifierStart($ch)) {
      $this->index++;
    } else {
      $this->throwError('Unexpected ' . $this->exprI($this->index), $this->index);
    }

    while ($this->index < $this->length) {
      $ch = $this->exprICode($this->index);
      if ($this->isIdentifierPart($ch)) {
        $this->index++;
      } else {
        break;
      }
    }
    $identifier = substr($this->expr, $start, $this->index-$start);

    if(array_key_exists($identifier, $this->literals)) {
      return array(
        'type' => self::LITERAL,
        'value' => $this->literals[$identifier],
        'raw' => $identifier
      );
    } else if($identifier === $this->this_str) {
      return array( 'type' => self::THIS_EXP);
    } else {
      return array(
        'type' => self::IDENTIFIER,
        'name' => $identifier
      );
    }
  }

  // Gobbles a list of arguments within the context of a function call
  // or array literal. This function also assumes that the opening character
  // `(` or `[` has already been gobbled, and gobbles expressions and commas
  // until the terminator character `)` or `]` is encountered.
  // e.g. `foo(bar, baz)`, `my_func()`, or `[bar, baz]`
  private function gobbleArguments ($termination) {
    $ch_i = null;
    $args = array();
    $node = null;
    while ($this->index < $this->length) {
      $this->gobbleSpaces();
      $ch_i = $this->exprICode($this->index);
      if($ch_i === $termination) { // done parsing
        $this->index++;
        break;
      } else if ($ch_i === self::COMMA_CODE) { // between expressions
        $this->index++;
      } else {
        $node = $this->gobbleExpression();
        if(!$node || $node['type'] === self::COMPOUND) {
          $this->throwError('Expected comma', $this->index);
        }
        array_push($args, $node);
      }
    }
    return $args;
  }

  // Gobble a non-literal variable name. This variable name may include properties
  // e.g. `foo`, `bar.baz`, `foo['bar'].baz`
  // It also gobbles function calls:
  // e.g. `Math.acos(obj.angle)`
  private function gobbleVariable () {
    $ch_i = null;
    $node = null;
    $ch_i = $this->exprICode($this->index);
      
    if($ch_i === self::OPAREN_CODE) {
      $node = $this->gobbleGroup();
    } else {
      $node = $this->gobbleIdentifier();
    }
    $this->gobbleSpaces();
    $ch_i = $this->exprICode($this->index);
    while ($ch_i === self::PERIOD_CODE || $ch_i === self::OBRACK_CODE || $ch_i === self::OPAREN_CODE) {
      $this->index++;
      if($ch_i === self::PERIOD_CODE) {
        $this->gobbleSpaces();
        $node = array(
          'type' => self::MEMBER_EXP,
          'computed' => false,
          'object' => $node,
          'property' => $this->gobbleIdentifier()
        );
      } else if($ch_i === self::OBRACK_CODE) {
        $node = array(
          'type' => self::MEMBER_EXP,
          'computed' => true,
          'object' => $node,
          'property' => $this->gobbleExpression()
        );
        $this->gobbleSpaces();
        $ch_i = $this->exprICode($this->index);
        if($ch_i !== self::CBRACK_CODE) {
          $this->throwError('Unclosed [', $this->index);
        }
        $this->index++;
      } else if($ch_i === self::OPAREN_CODE) {
        // A function call is being made; gobble all the arguments
        $node = array(
          'type' => self::CALL_EXP,
          'arguments' => $this->gobbleArguments(self::CPAREN_CODE),
          'callee' => $node
        );
      }
      $this->gobbleSpaces();
      $ch_i = $this->exprICode($this->index);
    }
    return $node;
  }

  // Responsible for parsing a group of things within parentheses `()`
  // This function assumes that it needs to gobble the opening parenthesis
  // and then tries to gobble everything within that parenthesis, assuming
  // that the next thing it should see is the close parenthesis. If not,
  // then the expression probably doesn't have a `)`
  private function gobbleGroup () {
    $this->index++;
    $node = $this->gobbleExpression();
    $this->gobbleSpaces();
    if($this->exprICode($this->index) === self::CPAREN_CODE) {
      $this->index++;
      return $node;
    } else {
      $this->throwError('Unclosed (', $this->index);
    }
  }

  // Responsible for parsing Array literals `[1, 2, 3]`
  // This function assumes that it needs to gobble the opening bracket
  // and then tries to gobble the expressions as arguments.
  private function gobbleArray () {
    $this->index++;
    return array(
      'type' => self::ARRAY_EXP,
      'elements' => $this->gobbleArguments(self::CBRACK_CODE)
    );
  }
}